# === Stage 1: Build the React application ===
# Use a lightweight Node.js image for building the app
FROM node:18-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Failsafe step: Clear the npm cache and then install dependencies.
# The `|| true` part ensures the script doesn't fail if the cache folder doesn't exist.
RUN npm cache clean --force || true && npm install

# Copy all the frontend source files
COPY . .

# Build the React app for production
RUN npm run build

# === Stage 2: Serve the application with Nginx ===
# Use a lightweight Nginx image
FROM nginx:alpine as production-stage

# Copy the built files from the build-stage to the Nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
