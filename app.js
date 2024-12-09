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
        <title>Red and Blue Buttons</title>
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
        <h1>Choose a Button</h1>
        <button class="red" onclick="alert('Red Button Clicked!')">Red Button</button>
        <button class="blue" onclick="alert('Blue Button Clicked!')">Blue Button</button>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
