const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
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
        </style>
    </head>
    <body>
        <h1>Rate-Limited Buttons</h1>
        <button class="red" onclick="handleClick('red')">Red Button</button>
        <button class="blue" onclick="handleClick('blue')">Blue Button</button>
        <p id="message"></p>

        <script>
            const clickLimits = {
                red: { count: 0, timer: null },
                blue: { count: 0, timer: null }
            };
            const MAX_CLICKS = 10; // Maximum clicks allowed per minute
            const TIME_LIMIT = 60000; // 1 minute in milliseconds

            function handleClick(buttonType) {
                const button = clickLimits[buttonType];
                if (!button.timer) {
                    // Start a new timer if not already started
                    button.timer = setTimeout(() => {
                        button.count = 0; // Reset count after 1 minute
                        button.timer = null;
                    }, TIME_LIMIT);
                }

                if (button.count < MAX_CLICKS) {
                    button.count++;
                    alert(\`\${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)} Button Clicked!\`);
                } else {
                    document.getElementById('message').innerText = \`You have reached the maximum clicks for the \${buttonType} button. Please wait a minute.\`;
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
