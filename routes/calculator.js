import express from 'express';
// other imports maybe required based on your logic 

const router = express.Router();

// Adding Route guard 
const requireAuth = (req, res, next) => {

  if (!req.session.user) {
    return res.redirect('/login');
  }
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
router.get('/calculator', requireAuth, (req, res) => { });

export default router;