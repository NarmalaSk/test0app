# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /apple1

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the app's code into the container
COPY . .

# Expose the app's port
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "start"]
