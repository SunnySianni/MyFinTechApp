import express from 'express';
import User  from '../models/User.js';
import  Transaction  from '../models/Transaction.js';
const router = express.Router();

// Authentication middleware
// This function checks if the user is logged in before allowing access to protected routes
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    // If user is not logged in, redirect to login page
    return res.redirect('/login');
  }
  // If user is logged in, proceed to the next middleware/route handler
  next();
};

/**
 * @swagger
 * /calculator:
 *   get:
 *     summary: Financial Calculator Page
 *     description: Displays the financial calculator interface for compound interest calculations
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Calculator page rendered successfully
 *       302:
 *         description: Redirects to login if not authenticated
 */
router.get('/calculator', requireAuth, async (req, res) => {
  try {
    // Fetch the current user's data from the database
    const user = await User.findByPk(req.session.user.id);

    if (!user) {
      // If user not found in database, log them out and redirect to login
      req.session.destroy();
      return res.redirect('/login');
    }

    // Render the calculator page with user data
    res.render('calculator', {
      username: user.username,
      balance: user.balance,
      // You can add more user-specific data here as needed
    });
  } catch (error) {
    // Log the error and render an error page
    console.error('Error in calculator route:', error);
    res.status(500).render('error', { message: 'An error occurred while loading the calculator.' });
  }
});

// Add a route for handling calculator form submission
router.post('/calculator', requireAuth, async (req, res) => {
  try {
    const { principal, rate, time } = req.body;

    // Perform compound interest calculation
    const amount = principal * Math.pow((1 + rate / 100), time);
    const interest = amount - principal;

    // Update user's balance in the database
    const user = await User.findByPk(req.session.user.id);
    if (user) {
      user.balance += interest;
      await user.save();
    }

    // Redirect back to calculator page with result
    res.redirect('/calculator?result=' + encodeURIComponent(JSON.stringify({ amount, interest })));
  } catch (error) {
    console.error('Error in calculator calculation:', error);
    res.status(500).render('error', { message: 'An error occurred during calculation.' });
  }
});

export default router;