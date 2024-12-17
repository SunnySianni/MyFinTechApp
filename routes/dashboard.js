import express from 'express';
// other imports maybe required based on your logic 

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

// Adding Route guard 
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
router.get('/dashboard', requireAuth, async (req, res) => { });

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
router.post('/api/transaction', requireAuth, async (req, res) => { });



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
router.get('/transactions', requireAuth, async (req, res) => { });

export default router;