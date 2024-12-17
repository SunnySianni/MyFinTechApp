import express from 'express';
// other imports maybe required based on your logic 

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         balance:
 *           type: number
 *           format: float
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Display login page
 *     description: Returns the login page
 *     responses:
 *       200:
 *         description: Login page rendered successfully
 */
router.get('/login', (req, res) => {
  res.render('login');
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or back to login on failure
 */
router.post('/login', async (req, res) => { });

/**
 * @swagger
 * /register:
 *   get:
 *     summary: Display registration page
 *     description: Returns the registration page
 *     responses:
 *       200:
 *         description: Registration page rendered successfully
 */
router.get('/register', (req, res) => {
  res.render('register');
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register new user
 *     description: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or back to register on failure
 */
router.post('/register', async (req, res) => { });

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user
 *     description: Destroys user session and redirects to home page
 *     security:
 *       - session: []
 *     responses:
 *       302:
 *         description: Redirects to home page after logout
 */
router.get('/logout', (req, res) => {

  req.session.destroy((err) => {
  
    if (err) {
      console.error('Logout error:', err);
    }

    res.redirect('/');

  });
});

export default router
