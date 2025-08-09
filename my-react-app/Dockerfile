# === Single-Stage Dockerfile for a reliable build ===
# Use a Node.js image to build the React application
FROM node:18 as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Nginx image to serve the built app
FROM nginx:alpine as final
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# The default command to start Nginx
CMD ["nginx", "-g", "daemon off;"]