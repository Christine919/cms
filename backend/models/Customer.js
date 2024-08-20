import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phone_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sickness: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pregnant: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stratum_corneum: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skin_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  skincare_program: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  micro_surgery: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Customer;
