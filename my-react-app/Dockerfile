# Stage 1: Build the React application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built files from the builder stage to the Nginx server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
