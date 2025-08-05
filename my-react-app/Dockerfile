# === Single-Stage Dockerfile for a reliable build ===
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies using 'npm ci' for a clean and reliable install
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Use a lightweight Nginx image to serve the built app
FROM nginx:alpine as final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
