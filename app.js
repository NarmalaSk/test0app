require('dotenv').config();
const express = require('express');
const { Client } = require('mysql'); // Use 'mysql' for MySQL
const app = express();
const port = process.env.PORT || 8080;

// PostgreSQL database client setup using environment variables
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`, // Cloud SQL socket connection
});

// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to Cloud SQL'))
  .catch(err => console.error('Error connecting to database', err.stack));

// Middleware to parse JSON body in POST requests
app.use(express.json());

// Simple route to test database connection
app.get('/', (req, res) => {
  res.send('Hello, Cloud Run connected to Cloud SQL!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
