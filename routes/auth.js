import express from 'express';
import bcrypt from 'bcrypt';
import  User  from '../models/User.js'; // Import User model
import authenticateUser from '../middleware/auth.js'; // Import authentication middleware

const router = express.Router();

// ... (keep all the existing Swagger documentation)

// Route to display the login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Route to handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    // If user not found, redirect back to login with error message
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare provided password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    // If password is invalid, redirect back to login with error message
    if (!isValidPassword) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Set user ID in session and redirect to dashboard
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch (error) {
    // Log error and redirect back to login with generic error message
    console.error('Login error:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
});

// Route to display the registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Route to handle user registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });

    // If user exists, redirect back to registration with error message
    if (existingUser) {
      req.flash('error', 'Email already in use');
      return res.redirect('/register');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in the database
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      balance: 0.00 // Set initial balance to 0
    });

    // Set user ID in session and redirect to dashboard
    req.session.userId = newUser.id;
    res.redirect('/dashboard');
  } catch (error) {
    // Log error and redirect back to registration with generic error message
    console.error('Registration error:', error);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/register');
  }
});

// Route to handle user logout
router.get('/logout', authenticateUser, (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      // Log any errors that occur during session destruction
      console.error('Logout error:', err);
    }
    // Redirect to home page after logout
    res.redirect('/');
  });
});

export default router;