import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js'; 

const User = sequelize.define('User', {
 // Define user attributes (e.g., id, username, email, password_hash, balance)
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
});

export default User;