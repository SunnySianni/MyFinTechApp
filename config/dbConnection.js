import { Sequelize } from 'sequelize';
import 'dotenv/config'

console.log("Connecting to database..."); 
console.log("Connecting to database..."); 
console.log("Process.env.D"); 
console.log("Connecting to database..."); 


const dbconn = new Sequelize(
  
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  
  {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: true,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false
  //   }
  // }
});

export default dbconn;
