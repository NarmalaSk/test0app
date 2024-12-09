const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Get the visitor's IP address
  const visitorIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
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
            const MAX_CLICKS = 10; // Maximum clicks allowed per minute
            const TIME_LIMIT = 60000; // 1 minute in milliseconds
            const clickLimits = {
                red: { count: 0, timer: null },
                blue: { count: 0, timer: null }
            };

            function updateClickInfo(buttonType) {
                document.getElementById(\`\${buttonType}ClickInfo\`).innerText = \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button clicks: \${clickLimits[buttonType].count}\`;
            }

            function handleClick(buttonType) {
                const buttonData = clickLimits[buttonType];
                const button = document.getElementById(\`\${buttonType}Button\`);

                if (!buttonData.timer) {
                    buttonData.timer = setTimeout(() => {
                        buttonData.count = 0; // Reset count after 1 minute
                        buttonData.timer = null;
                        button.disabled = false;
                        button.classList.remove('disabled');
                        updateClickInfo(buttonType);
                        document.getElementById('message').innerText = \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button is active again!\`;
                    }, TIME_LIMIT);
                }

                if (buttonData.count < MAX_CLICKS) {
                    buttonData.count++;
                    updateClickInfo(buttonType);
                } else {
                    button.disabled = true;
                    button.classList.add('disabled');
                    document.getElementById('message').innerText = \`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} button is disabled. Wait for 1 minute.\`;
                }
            }
        </script>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
