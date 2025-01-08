import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import flash from 'connect-flash';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import calculatorRoutes from './routes/calculator.js';
import { fileURLToPath } from "url";
import http from 'http';
import db from './models/index.js';
import { Server } from 'socket.io';

// Setup Server and Application config 
const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name

app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// Set trust proxy to handle rate limiting behind proxy
app.set('trust proxy', 1);
app.use(cors());

// What does Morgan do for your app? 
app.use(morgan('dev'));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/static', express.static(path.join(__dirname, 'static')));

app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Global middleware for user session
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  next();
});


// what is the code below doing for our application? 
app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if (req.method === 'OPTIONS') {

    res.sendStatus(200);

  } else {

    next();
  }
});


// Required Authorization for Router
const requireAuth = (req, res, next) => {
  console.log('Session:', req.session); // Add this for debugging
  if (!req.session.userId || !req.session.user) {
    req.flash('error', 'Please login to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// Routes
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', calculatorRoutes);

app.get('/', (req, res) => {
  res.render('index'); 

});

app.get('/register', (req, res) => {
  res.redirect('/auth/register');
});

app.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

app.get('*',  (req, res) => {
  res.redirect('/')
}); 

// After creating the HTTP server
const io = new Server(server);

// Store io instance on app for use in routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong!' 
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});