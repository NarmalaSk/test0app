require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL database client setup using environment variables
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Cloud SQL socket connection
  host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
});

// Connect to PostgreSQL
client.connect();

// Middleware to parse JSON body in POST requests
app.use(express.json());

// Store click data for each user and button
let clickData = {
  red: { count: 0, timestamp: Date.now() },
  blue: { count: 0, timestamp: Date.now() }
};

// Function to get the user's IP address
async function getUserIp(req) {
  const response = await axios.get(`http://api.ip-api.com/${req.headers['x-forwarded-for']}?json`);
  return response.data;
}

// Middleware to reset the click counts every minute
function resetClickCounts() {
  setInterval(() => {
    clickData.red.count = 0;
    clickData.blue.count = 0;
  }, 60000);
}

resetClickCounts(); // Start resetting every minute

// Route to serve the home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Button Click App</title>
      </head>
      <body>
        <h1>Click the Buttons!</h1>
        <button id="red-button" style="background-color: red;">Red Button</button>
        <button id="blue-button" style="background-color: blue;">Blue Button</button>
        <script>
          async function sendClickData(buttonColor) {
            const response = await fetch('/click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ color: buttonColor })
            });
            const data = await response.json();
            alert(data.message);
          }

          document.getElementById('red-button').addEventListener('click', () => sendClickData('red'));
          document.getElementById('blue-button').addEventListener('click', () => sendClickData('blue'));
        </script>
      </body>
    </html>
  `);
});

// Route to handle button clicks
app.post('/click', async (req, res) => {
  let { color } = req.body;
  if (!['red', 'blue'].includes(color)) {
    return res.status(400).json({ message: 'Invalid button color' });
  }

  // Get the user's IP address
  const userIp = await getUserIp(req);

  // Get the current timestamp
  const currentTimestamp = Date.now();
  const timeDifference = currentTimestamp - clickData[color].timestamp;

  if (timeDifference > 60000) {
    // Reset the count if the time difference is greater than 1 minute
    clickData[color].count = 0;
    clickData[color].timestamp = currentTimestamp;
  }

  // Check if the click count exceeds 10 within 1 minute
  if (clickData[color].count >= 10) {
    return res.status(429).json({ message: `You can only click the ${color} button 10 times per minute` });
  }

  // Increment click count and log the data
  clickData[color].count++;

  // Insert the click data into the PostgreSQL database
  try {
    await client.query(
      `INSERT INTO click_data (button_color, ip_address, click_count) VALUES ($1, $2, $3)`,
      [color, userIp.query, clickData[color].count]
    );
  } catch (error) {
    console.error('Error inserting click data into DB:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  return res.json({ message: `Button ${color} clicked!` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
