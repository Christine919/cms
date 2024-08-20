import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Associations
Invoice.belongsTo(Order, { foreignKey: 'orderId' });

export default Invoice;
