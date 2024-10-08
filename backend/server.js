import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg  from 'pg'; 
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { Pool } = pkg;

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

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Example user data; replace with actual authentication logic
  const user = {
    username: 'britney',
    password: '1234', // Note: Passwords should be hashed in production
  };

  // Check if the provided username and password match
  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// CRUD Operations for Customers
// Define the getCustomerByPhoneNo function
async function getCustomerByPhoneNo(phoneNo) {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE phone_no = $1', [phoneNo]);
    return result.rows[0]; // Return the first row if found, otherwise return undefined
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

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

// Get all customers by ID
app.get('/customers/id/:id', async (req, res) => {
  const customerId = parseInt(req.params.id, 10); // Convert ID to integer for safety

  if (isNaN(customerId)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  try {
    const result = await pool.query('SELECT * FROM customers WHERE user_id = $1', [customerId]); // Fetch customer details by ID
    const customer = result.rows[0]; // Get the first result if found

    if (customer) {
      res.json(customer); // Send customer details as response
    } else {
      res.status(404).json({ message: 'Customer not found' }); // Customer not found
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' }); // Server error
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
  const { id } = req.params;

  try {
    // Optionally delete or update related orders
    await pool.query('DELETE FROM orders WHERE user_id = $1', [id]);
    
    // Now delete the customer
    await pool.query('DELETE FROM customers WHERE user_id = $1', [id]);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD Operations for Services
// Add a new service
app.post('/services', async (req, res) => {
  try {
    const { service_name, service_price } = req.body;
    await pool.query('INSERT INTO services (service_name, service_price) VALUES ($1, $2)', [service_name, service_price]);
    const result = await pool.query('SELECT * FROM services ORDER BY service_id DESC LIMIT 1'); // Get the newly added service
    res.status(201).json({ message: 'Service created successfully', service: result.rows[0] });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Update a service
app.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, service_price } = req.body;
    await pool.query('UPDATE services SET service_name = $1, service_price = $2 WHERE service_id = $3', [service_name, service_price, id]);
    const result = await pool.query('SELECT * FROM services WHERE service_id = $1', [id]); // Get the updated service
    res.json({ message: 'Service updated successfully', service: result.rows[0] });
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

// CRUD Operations for Products
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

// Update a product
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_price, stock } = req.body;

    await pool.query('UPDATE products SET product_name = $1, product_price = $2, stock = $3 WHERE product_id = $4', [product_name, product_price, stock, id]);
    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]); 
    res.json({ message: 'Product updated successfully',  product: result.rows[0] });
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

// CRUD Operations for Appointments
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

// Update an appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the appointment ID from the route parameter
    const { app_date, app_time, app_status, remark } = req.body; // Get data from request body

    // Log the incoming data to verify correctness
    console.log('Updating appointment with ID:', id);
    console.log('Data to update:', { app_date, app_time, app_status, remark });

    // Ensure `id` is a valid integer and check if `user_id` is used correctly
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Update query
    await pool.query(
      'UPDATE appointments SET app_date = $1, app_time = $2, app_status = $3, remark = $4 WHERE app_id = $5',
      [app_date, app_time, app_status, remark, id] // Ensure `id` is properly passed and converted
    );
    
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
// Route to add a new order
app.post('/orders', async (req, res) => {
  console.log('Order Request Data:', req.body);

 // Extract order data from the request body
 const orderData = req.body;
    
 // Validate required fields
 const { user_id, fname, email, phone_no, total_order_price, payment_method, order_status, order_remark, products, services } = orderData;

  // Validate required fields
  if (!user_id || !fname || !email || !phone_no || !total_order_price || !payment_method || !order_status || !products || !services) {
    return res.status(400).json({ error: 'Missing required order data' });
  }

  const client = await pool.connect(); // Use a client to manage transactions
  try {
    await client.query('BEGIN');

    // Insert into orders table
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, fname, email, phone_no, total_order_price, payment_method, order_status, order_remark) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id',
      [user_id, fname, email, phone_no, total_order_price, payment_method, order_status, order_remark]
    );
    
    const order_id = orderResult.rows[0].order_id;

    // Insert services into OrderServices
    for (const service of services) {
      await client.query(
        'INSERT INTO orderservices (order_id, service_id, service_name, service_price, service_disc, total_service_price) VALUES ($1, $2, $3, $4, $5, $6)',
        [order_id, service.service_id, service.service_name, service.service_price, service.service_disc, service.total_service_price]
      );
    }

    // Insert products into OrderProducts
    for (const product of products) {
      await client.query(
        'INSERT INTO orderproducts (order_id, product_id, product_name, product_price, quantity, product_disc, total_product_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [order_id, product.product_id, product.product_name, product.product_price, product.quantity, product.product_disc, product.total_product_price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', order_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  } finally {
    client.release();
  }
});

// Add new service to an order
app.post('/orders/:orderId/services', async (req, res) => {
  const { orderId } = req.params;
  const { service_id, service_name, service_price, service_disc } = req.body;

  try {
    await query(
      `INSERT INTO orderservices (order_id, service_id, service_name, service_price, service_disc, total_service_price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, service_id, service_name, service_price, service_disc, service_price] // Calculate total_service_price as needed
    );
    res.send({ message: 'Service added successfully' });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).send('Error adding service');
  }
});

// Add new product to an order
app.post('/orders/:orderId/products', async (req, res) => {
  const { orderId } = req.params;
  const { product_id, product_name, product_price, quantity, product_disc } = req.body;

  try {
    await query(
      `INSERT INTO orderproducts (order_id, product_id, product_name, product_price, quantity, product_disc, total_product_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, product_id, product_name, product_price, quantity, product_disc, product_price * quantity] // Calculate total_product_price
    );
    res.send({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Error adding product');
  }
});

// Get all orders
app.get('/orders', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT 
              order_id, 
              order_created_date, 
              user_id,
              fname, 
              phone_no, 
              total_order_price, 
              paid_date, 
              order_status
          FROM orders
          ORDER BY order_created_date DESC
      `);
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders by ID
app.get('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
      const orderResult = await pool.query(`
          SELECT 
              o.order_id, 
              order_created_date,
              o.user_id,
              o.fname, 
              o.email, 
              o.phone_no, 
              o.total_order_price, 
              o.payment_method, 
              o.order_status, 
              o.order_remark, 
              o.photos::jsonb
          FROM orders o
          WHERE o.order_id = $1
      `, [orderId]);

      const servicesResult = await pool.query(`
          SELECT 
              os.order_service_id,
              os.service_id,
              os.service_name, 
              os.service_price, 
              os.service_disc, 
              os.total_service_price
          FROM orderservices os
          WHERE os.order_id = $1
      `, [orderId]);

      const productsResult = await pool.query(`
          SELECT 
             op.order_product_id,
             op.product_id,
              op.product_name, 
              op.product_price, 
              op.quantity, 
              op.product_disc, 
              op.total_product_price
          FROM orderproducts op
          WHERE op.order_id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
      }

      const orderDetails = {
          ...orderResult.rows[0],
          services: servicesResult.rows,
          products: productsResult.rows,
      };

      res.status(200).json(orderDetails);
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders by user ID
app.get('/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
  res.json(orders.rows);
});

// Update an order
app.put('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { fname, email, phone_no, total_order_price, payment_method, order_status, order_remark, services, products } = req.body;

  try {
      // Update order details
      const updateOrderQuery = `
          UPDATE orders 
          SET fname = $1, email = $2, phone_no = $3, total_order_price = $4, payment_method = $5, order_status = $6, order_remark = $7 
          WHERE order_id = $8
      `;
      await pool.query(updateOrderQuery, [fname, email, phone_no, total_order_price, payment_method, order_status, order_remark, orderId]);

      // Update existing services
      for (let service of services) {
          const { order_service_id, service_name, service_price, service_disc, total_service_price } = service;
          if (order_service_id) {
              // Update existing service
              const updateServiceQuery = `
                  UPDATE orderservices
                  SET service_name = $1, service_price = $2, service_disc = $3, total_service_price = $4
                  WHERE order_service_id = $5
              `;
              await pool.query(updateServiceQuery, [service_name, service_price, service_disc, total_service_price, order_service_id]);
          } else {
              return res.status(400).json({ error: 'Service ID missing for update' });
          }
      }

      // Update existing products
      for (let product of products) {
          const { order_product_id, product_name, product_price, quantity, product_disc, total_product_price } = product;
          if (order_product_id) {
              // Update existing product
              const updateProductQuery = `
                  UPDATE orderproducts
                  SET product_name = $1, product_price = $2, quantity = $3, product_disc = $4, total_product_price = $5
                  WHERE order_product_id = $6
              `;
              await pool.query(updateProductQuery, [product_name, product_price, quantity, product_disc, total_product_price, order_product_id]);
          } else {
              return res.status(400).json({ error: 'Product ID missing for update' });
          }
      }

      res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
      // res.status(500).json({ error: error.message });
  }
});

// Add new service
app.post('/orderservices', async (req, res) => {
  const { order_id, service_id, service_name, service_price, service_disc, total_service_price } = req.body;

  try {
      // Validate input data
      if (!order_id || !service_name || service_price === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const insertServiceQuery = `
          INSERT INTO orderservices (order_id, service_id, service_name, service_price, service_disc, total_service_price)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_service_id
      `;
      const result = await pool.query(insertServiceQuery, [order_id, service_id, service_name, service_price, service_disc, total_service_price]);
      const newServiceId = result.rows[0].order_service_id;
      res.json({ order_service_id: newServiceId, ...req.body });
  } catch (error) {
      console.error('Error adding service:', error);
      res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/orderproducts', async (req, res) => {
  const { order_id, product_id, product_name, product_price, quantity, product_disc, total_product_price } = req.body;

  try {
      if (!order_id || !product_id) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const insertProductQuery = `
          INSERT INTO orderproducts (order_id, product_id, product_name, product_price, quantity, product_disc, total_product_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await pool.query(insertProductQuery, [order_id, product_id, product_name, product_price, quantity, product_disc, total_product_price]);

      res.json({ message: 'Product added successfully' });
  } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: error.message });
  }
});

// Delete an order
app.delete('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
      await pool.query('DELETE FROM orders WHERE order_id = $1', [orderId]);
      await pool.query('DELETE FROM orderservices WHERE order_id = $1', [orderId]);
      await pool.query('DELETE FROM orderproducts WHERE order_id = $1', [orderId]);

      res.json({ message: 'Order and associated services/products deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.delete('/orders/:orderId/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  try {
      await pool.query('DELETE FROM orderservices WHERE order_service_id = $1', [serviceId]);
      res.json({ message: 'Service deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.delete('/orders/:orderId/product/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
      await pool.query('DELETE FROM orderproducts WHERE order_product_id = $1', [productId]);
      res.json({ message: 'Product deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});