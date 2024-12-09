# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files into the container
COPY . .

# Expose the port your app is running on
EXPOSE 8080

# Start the Node.js application
CMD ["npm", "start"]
