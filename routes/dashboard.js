import express from 'express';
import User  from '../models/User.js';
import  Transaction  from '../models/Transaction.js';
import { Op } from 'sequelize';

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
      return res.redirect('/login');
    }

    const recentTransactions = await Transaction.findAll({
      where: { user_id: user.id },
      order: [['timestamp', 'DESC']],
      limit: 5
    });

    res.render('dashboard', {
      user: user,
      balance: user.balance,
      recentTransactions: recentTransactions
    });
  } catch (error) {
    console.error('Error in dashboard route:', error);
    res.status(500).render('error', { message: 'An error occurred while loading the dashboard.' });
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
    const user = await User.findByPk(req.session.user.id);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (type === 'withdrawal' && user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      description,
      user_id: user.id,
      timestamp: new Date()
    });

    if (type === 'deposit') {
      user.balance += amount;
    } else {
      user.balance -= amount;
    }

    await user.save();

    res.json({
      balance: user.balance,
      transaction: transaction
    });
  } catch (error) {
    console.error('Error in transaction creation:', error);
    res.status(500).json({ error: 'An error occurred while processing the transaction.' });
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
    res.status(500).render('error', { message: 'An error occurred while loading transactions.' });
  }
});

export default router;