# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application source
COPY . .

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
