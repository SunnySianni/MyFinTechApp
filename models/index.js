import sequelize from '../config/database.js';
import User from './User.js';
import Transaction from './Transaction.js';

// Define model relationships here
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

const db = {
  sequelize,
  User,
  Transaction
};

export default db; 