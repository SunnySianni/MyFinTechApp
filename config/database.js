import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Function to create database if it doesn't exist
async function createDatabaseIfNotExists() {
  try {
    // Create a temporary connection without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database check completed');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

// Create Sequelize instance for MySQL
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  logging: console.log, // Change to proper logging
  retry: {
    max: 3,
    timeout: 3000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection and sync models
async function initializeDatabase() {
  try {
    // First create database if it doesn't exist
    await createDatabaseIfNotExists();

    // Then authenticate and sync models
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true }); // Use alter:true to update existing tables
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    if (error.original) {
      console.error('Original error:', {
        code: error.original.code,
        errno: error.original.errno,
        sqlMessage: error.original.sqlMessage,
        sqlState: error.original.sqlState
      });
    }
    // Exit the process if database initialization fails
    process.exit(1);
  }
}

// Initialize the database
initializeDatabase();

export default sequelize; 