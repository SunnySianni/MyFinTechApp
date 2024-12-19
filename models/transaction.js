// Import necessary modules from Sequelize
import { DataTypes } from 'sequelize';
// Import the database connection configuration
import sequelize from '../config/dbConnection.js';
// Import the User model to establish the relationship between User and Transaction
import User from './User.js';

// Define the Transaction model
const Transaction = sequelize.define('Transaction', {
  // Define the primary key 'id' field
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  // Define the 'amount' field to store the transaction amount
  // DECIMAL(10, 2) allows for 10 digits in total, with 2 decimal places
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // Define the 'type' field as an ENUM to restrict possible values
  // This ensures that transactions can only be of type 'deposit', 'withdrawal', or 'transfer'
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
    allowNull: false
  },
  // Define the 'description' field for additional transaction details
  // This field is optional (allowNull: true)
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Define the 'user_id' field as a foreign key to link transactions to users
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // This establishes the relationship with the User model
      key: 'id'    // This specifies which column in the User model to reference
    }
  }
}, {
  // Additional model options
  tableName: 'transactions', // Explicitly set the table name in the database
  timestamps: true, // Automatically add and manage createdAt and updatedAt fields
});

// Define the association between Transaction and User models
// This establishes that each Transaction belongs to one User
Transaction.belongsTo(User, { foreignKey: 'user_id' });
// This establishes that each User can have many Transactions
User.hasMany(Transaction, { foreignKey: 'user_id' });

// Export the Transaction model to be used in other parts of the application
export default Transaction;