const http = require('http');
const mysql = require('mysql2');

// MySQL connection setup
const pool = mysql.createPool({
  host: '10.75.16.4', // Cloud SQL instance connection name
  user: 'sqlserver', // Your DB user
  password: 'redblue', // Your DB password
  database: 'redblue', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const PORT = process.env.PORT || 3000;

// Helper function to extract IPv4 address
const getIPv4Address = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  return ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
};

// HTML content for the app
const getHTMLContent = (visitorIP) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rate-Limited Buttons</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 50px;
          }
          button {
              margin: 10px;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              border: none;
              color: white;
          }
          .red {
              background-color: red;
          }
          .blue {
              background-color: blue;
          }
          .disabled {
              background-color: grey;
              cursor: not-allowed;
          }
          .click-info {
              margin-top: 20px;
              font-size: 18px;
          }
      </style>
  </head>
  <body>
      <h1>Rate-Limited Buttons</h1>
      <p>Your IP address: <strong>${visitorIP}</strong></p>
      <button id="redButton" class="red" onclick="handleClick('red')">Red Button</button>
      <button id="blueButton" class="blue" onclick="handleClick('blue')">Blue Button</button>
      <div class="click-info">
          <p id="redClickInfo">Red button clicks: 0</p>
          <p id="blueClickInfo">Blue button clicks: 0</p>
          <p id="message"></p>
      </div>
      <script>
          const MAX_CLICKS = 10;
          const TIME_LIMIT = 60000; // 1 minute
          const clickLimits = {
              red: { count: 0, timer: null },
              blue: { count: 0, timer: null }
          };

          const updateClickInfo = (buttonType) => {
              document.getElementById(\`\${buttonType}ClickInfo\`).innerText = 
                \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button clicks: \${clickLimits[buttonType].count}\`;
          };

          const handleClick = (buttonType) => {
              const buttonData = clickLimits[buttonType];
              const button = document.getElementById(\`\${buttonType}Button\`);

              // Log click to the backend (this sends a request to the Node.js server)
              fetch('/log-click', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ button_type: buttonType })
              });

              if (!buttonData.timer) {
                  buttonData.timer = setTimeout(() => {
                      buttonData.count = 0;
                      buttonData.timer = null;
                      button.disabled = false;
                      button.classList.remove('disabled');
                      updateClickInfo(buttonType);
                      document.getElementById('message').innerText = 
                        \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button is active again!\`;
                  }, TIME_LIMIT);
              }

              if (buttonData.count < MAX_CLICKS) {
                  buttonData.count++;
                  updateClickInfo(buttonType);
              } else {
                  button.disabled = true;
                  button.classList.add('disabled');
                  document.getElementById('message').innerText = 
                    \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button is disabled. Wait for 1 minute.\`;
              }
          };
      </script>
  </body>
  </html>
`;

// Route for logging clicks to the database
const logClick = (buttonType) => {
  pool.execute(
    'INSERT INTO clicks (button_type) VALUES (?)',
    [buttonType],
    (err, result) => {
      if (err) {
        console.error('Error logging click:', err);
      } else {
        console.log('Click logged:', result);
      }
    }
  );
};

// Create and start the HTTP server
const server = http.createServer((req, res) => {
  const visitorIP = getIPv4Address(req);

  if (req.method === 'POST' && req.url === '/log-click') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { button_type } = JSON.parse(body);
      logClick(button_type);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success' }));
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getHTMLContent(visitorIP));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
