import express from 'express';
import User  from '../models/User.js';
import  Transaction  from '../models/Transaction.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *         description:
 *           type: string
 *         user_id:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TransactionInput:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - description
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *         description:
 *           type: string
 */

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard
 *     description: Returns the dashboard page with recent transactions
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Dashboard rendered successfully
 *       302:
 *         description: Redirect to login if not authenticated
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }

    const transactions = await Transaction.findAll({
      where: { user_id: user.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.render('dashboard', {
      user: user,
      balance: user.balance,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error in dashboard route:', error);
    req.flash('error', 'An error occurred while loading the dashboard');
    res.redirect('/');
  }
});

/**
 * @swagger
 * /api/transaction:
 *   post:
 *     summary: Create new transaction
 *     description: Creates a new transaction (deposit or withdrawal)
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Insufficient funds or invalid input
 *       500:
 *         description: Server error
 */
router.post('/api/transaction', requireAuth, async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const userId = req.session.user.id;

    // Start a transaction using the sequelize instance
    const result = await sequelize.transaction(async (t) => {
      // Find user with transaction lock
      const user = await User.findByPk(userId, { 
        lock: true,
        transaction: t 
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Invalid amount');
      }

      // Check sufficient funds for withdrawal
      if (type === 'withdrawal' && user.balance < numAmount) {
        throw new Error('Insufficient funds');
      }

      // Create transaction record
      const transaction = await Transaction.create({
        amount: numAmount,
        type,
        description,
        user_id: userId
      }, { transaction: t });

      // Update user balance
      const newBalance = type === 'deposit' 
        ? parseFloat(user.balance) + numAmount 
        : parseFloat(user.balance) - numAmount;
      
      user.balance = newBalance;
      await user.save({ transaction: t });

      return { transaction, newBalance };
    });

    // Emit socket event for real-time updates
    req.app.get('io').emit('transactionComplete', {
      transaction: result.transaction,
      newBalance: result.newBalance
    });

    res.json(result);

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(400).json({ 
      error: error.message || 'Transaction failed' 
    });
  }
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieves all transactions for the authenticated user
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Transactions page rendered successfully
 *       302:
 *         description: Redirect to login if not authenticated
 */
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const transactions = await Transaction.findAll({
      where: { user_id: user.id },
      order: [['timestamp', 'DESC']]
    });

    res.render('transactions', {
      user: user,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error in transactions route:', error);
    req.flash('error', 'An error occurred while loading transactions');
    res.redirect('/dashboard');
  }
});

/**
 * @swagger
 * /api/transaction/{id}:
 *   put:
 *     summary: Edit a transaction
 *     description: Edits a transaction
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               editReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction edited successfully
 *       400:
 *         description: Insufficient funds or invalid input
 *       500:
 *         description: Server error
 */
router.put('/api/transaction/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, editReason } = req.body;
    const userId = req.session.user.id;

    const result = await sequelize.transaction(async (t) => {
      // Find transaction and lock it
      const transaction = await Transaction.findOne({
        where: { id, user_id: userId },
        lock: true,
        transaction: t
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Calculate balance difference
      const amountDiff = parseFloat(amount) - parseFloat(transaction.amount);
      
      // Find and lock user
      const user = await User.findByPk(userId, {
        lock: true,
        transaction: t
      });

      // Check if user has sufficient funds for withdrawal adjustment
      if (transaction.type === 'withdrawal' && user.balance < amountDiff) {
        throw new Error('Insufficient funds for this adjustment');
      }

      // Update user balance
      if (transaction.type === 'deposit') {
        user.balance = parseFloat(user.balance) + amountDiff;
      } else {
        user.balance = parseFloat(user.balance) - amountDiff;
      }

      // Update transaction
      transaction.amount = amount;
      transaction.description = description;
      transaction.edited = true;
      transaction.edit_reason = editReason;

      // Save changes
      await Promise.all([
        user.save({ transaction: t }),
        transaction.save({ transaction: t })
      ]);

      return { transaction, newBalance: user.balance };
    });

    // Emit socket event for real-time updates
    req.app.get('io').emit('transactionEdited', {
      transaction: result.transaction,
      newBalance: result.newBalance
    });

    res.json(result);
  } catch (error) {
    console.error('Transaction edit error:', error);
    res.status(400).json({ error: error.message || 'Failed to edit transaction' });
  }
});

export default router;