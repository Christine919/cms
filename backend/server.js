import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg'; // Import the entire module

const { Pool } = pkg; // Destructure Pool from the module

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if your frontend is on a different port or domain
}));

app.use(express.json());

// Define the getCustomerByPhoneNo function
async function getCustomerByPhoneNo(phoneNo) {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE phone_no = $1', [phoneNo]);
    return result.rows[0]; // Return the first row if found, otherwise return undefined
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Route to get a customer by phone number
app.get('/customers/:phoneNo', async (req, res) => {
  const phoneNo = req.params.phoneNo;
  try {
    const customer = await getCustomerByPhoneNo(phoneNo);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to add a new customer
app.post('/customers', async (req, res) => {
  try {
    const customerData = req.body;
    const result = await pool.query(
      'INSERT INTO customers (fname, lname, date_of_birth, phone_no, email, address, city, postcode, country, sickness, sex, pregnant, remark, stratum_corneum, skin_type, skincare_program, micro_surgery) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)',
      [customerData.fname, customerData.lname, customerData.date_of_birth, customerData.phone_no, customerData.email, customerData.address, customerData.city, customerData.postcode, customerData.country, customerData.sickness, customerData.sex, customerData.pregnant, customerData.remark, customerData.stratum_corneum, customerData.skin_type, customerData.skincare_program, customerData.micro_surgery]
    );
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    console.error('Error adding customer:', error); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: error.message }); // Send error message to client
  }
});

app.get('/api/customers/:phone_no', async (req, res) => {
  const { phone_no } = req.params;
  console.log('Fetching customer with phone number:', phoneNo); // Debugging line
  try {
    const customer = await pool.query(
      'SELECT user_id, fname, email, phone_no FROM customers WHERE phone_no = $1',
      [phone_no]
    );
    console.log('Query result:', result.rows); // Debugging line
    if (customer.rows.length > 0) {
      res.json(customer.rows[0]);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await pool.query(
      'SELECT service_id, service_name, service_price FROM services'
    );
    res.json(services.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await pool.query(
      'SELECT product_id, product_name, product_price FROM products'
    );
    res.json(products.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a new appointment
app.post('/appointments', async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Retrieve user_id based on phone_no
    const customer = await getCustomerByPhoneNo(appointmentData.phone_no);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Insert the appointment
    await pool.query(
      'INSERT INTO appointments (user_id, fname, lname, phone_no, app_date, app_time, remark, app_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [appointmentData.user_id, appointmentData.fname, appointmentData.lname, appointmentData.phone_no, appointmentData.app_date, appointmentData.app_time, appointmentData.remark, appointmentData.app_status]
    );
    res.status(201).json({ message: 'Appointment created successfully' });
  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to add a new order
app.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;

    // Validate and convert data
    const {
      user_id,
      fname,
      email,
      phone_no,
      service_id,
      service_name,
      service_price,
      product_id,
      product_name,
      product_price,
      qty,
      total_product_price,
      total_order_price,
      payment_method,
      paid_date,
      order_status,
      order_remark
    } = orderData;

    // Check for valid integers and convert empty strings to null or default values
    const parsedServiceId = parseInt(service_id, 10) || null;
    const parsedProductId = parseInt(product_id, 10) || null;
    const parsedQty = parseInt(qty, 10) || 0; // Assuming qty is zero if invalid
    const parsedServicePrice = parseFloat(service_price) || 0;
    const parsedProductPrice = parseFloat(product_price) || 0;
    const parsedTotalProductPrice = parseFloat(total_product_price) || 0;
    const parsedTotalOrderPrice = parseFloat(total_order_price) || 0;

    // Retrieve user_id based on phone_no
    const customer = await getCustomerByPhoneNo(phone_no);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Insert the order into the database
    const result = await pool.query(
      'INSERT INTO orders (user_id, fname, email, phone_no, service_id, service_name, service_price, product_id, product_name, product_price, qty, total_product_price, total_order_price, payment_method, paid_date, order_status, order_remark) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
      [
        customer.user_id, 
        fname,
        email,
        phone_no,
        parsedServiceId, 
        service_name, 
        parsedServicePrice, 
        parsedProductId, 
        product_name, 
        parsedProductPrice, 
        parsedQty, 
        parsedTotalProductPrice, 
        parsedTotalOrderPrice, 
        payment_method, 
        paid_date, 
        order_status,
        order_remark
      ]
    );
    res.status(201).json({ message: 'Order created successfully', order: result.rows[0] });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});