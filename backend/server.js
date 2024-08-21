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

// Get all customers
app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
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

// Update a customer
app.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fname, lname, date_of_birth, phone_no, email, address, city, postcode, country, sickness, sex, pregnant, remark, stratum_corneum, skin_type, skincare_program, micro_surgery } = req.body;
    await pool.query(
      'UPDATE customers SET fname = $1, lname = $2, date_of_birth = $3, phone_no = $4, email = $5, address = $6, city = $7, postcode = $8, country = $9, sickness = $10, sex = $11, pregnant = $12, remark = $13, stratum_corneum = $14, skin_type = $15, skincare_program = $16, micro_surgery = $17 WHERE user_id = $18',
      [fname, lname, date_of_birth, phone_no, email, address, city, postcode, country, sickness, sex, pregnant, remark, stratum_corneum, skin_type, skincare_program, micro_surgery, id]
    );
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a customer
app.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE user_id = $1', [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD Operations for Services

// Get all services
app.get('/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new service
app.post('/services', async (req, res) => {
  try {
    const { service_name, service_price } = req.body;
    await pool.query('INSERT INTO services (service_name, service_price) VALUES ($1, $2)', [service_name, service_price]);
    res.status(201).json({ message: 'Service created successfully' });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a service
app.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, service_price } = req.body;
    await pool.query('UPDATE services SET service_name = $1, service_price = $2 WHERE service_id = $3', [service_name, service_price, id]);
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a service
app.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM services WHERE service_id = $1', [id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// CRUD Operations for Products

// Get all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new product
app.post('/products', async (req, res) => {
  try {
    const { product_name, product_price, stock } = req.body; // Added stock
    if (!product_name || product_price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Product name, price, and stock are required' });
    }
    await pool.query('INSERT INTO products (product_name, product_price, stock) VALUES ($1, $2, $3)', [product_name, product_price, stock]);
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_price, stock } = req.body;
    if (!product_name || product_price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Product name, price, and stock are required' });
    }
    await pool.query('UPDATE products SET product_name = $1, product_price = $2, stock = $3 WHERE product_id = $4', [product_name, product_price, stock, id]);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE product_id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// CRUD Operations for Appointments

// Get all appointments
app.get('/appointments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Update an appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, date, time, status, service_id, service_remark } = req.body;
    await pool.query('UPDATE appointments SET user_id = $1, date = $2, time = $3, status = $4, service_id = $5, service_remark = $6 WHERE appointment_id = $7', [user_id, date, time, status, service_id, service_remark, id]);
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD Operations for Orders

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an order
app.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, service_id, product_id, qty, total_product_price, total_order_price, payment_method, paid_date, order_status, order_remark } = req.body;
    await pool.query(
      'UPDATE orders SET user_id = $1, service_id = $2, product_id = $3, qty = $4, total_product_price = $5, total_order_price = $6, payment_method = $7, paid_date = $8, order_status = $9, order_remark = $10 WHERE order_id = $11',
      [user_id, service_id, product_id, qty, total_product_price, total_order_price, payment_method, paid_date, order_status, order_remark, id]
    );
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an order
app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM orders WHERE order_id = $1', [id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
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