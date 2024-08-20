import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Customer from './Customer.js';

const Appointment = sequelize.define('Appointment', {
  app_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  app_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  app_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  app_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Associations
Appointment.belongsTo(Customer, { foreignKey: 'user_id' });

export default Appointment;
