import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Customer from './Customer.js';
import Service from './Service.js';
import Product from './Product.js';

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_service_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_product_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_order_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  order_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Associations
Order.belongsTo(Customer, { foreignKey: 'user_id' });
Order.belongsTo(Service, { foreignKey: 'service_id' });
Order.belongsTo(Product, { foreignKey: 'product_id' });

export default Order;
