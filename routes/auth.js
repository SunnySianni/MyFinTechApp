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
      return res.redirect('/auth/login');
    }

    // Compare provided password with stored hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    // If password is invalid, redirect back to login with error message
    if (!isValidPassword) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Set session data
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.flash('error', 'Login failed');
        return res.redirect('/auth/login');
      }
      res.redirect('/dashboard');
    });

  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
  }
});

// Route to display the registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Route to handle user registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/register');
    }

    // Check password strength
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long');
      return res.redirect('/auth/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      name: username,
      email: email.toLowerCase(), // Convert email to lowercase
      password_hash: hashedPassword
    });

    // Set user session
    req.session.userId = newUser.id;
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    req.flash('success', 'Registration successful!');
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      req.flash('error', validationErrors[0]); // Show first error
    } else {
      req.flash('error', 'Error registering new user');
    }
    
    res.redirect('/auth/register');
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