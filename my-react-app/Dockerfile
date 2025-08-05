# === Single-Stage Dockerfile for a reliable build ===
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies using 'npm install' for a clean and reliable install
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Nginx image to serve the built app
FROM nginx:alpine as final
COPY --from=build /app/dist /usr/share/