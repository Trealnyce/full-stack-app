# === Stage 1: Build the React application ===
FROM node:18-alpine as build-stage

# Install build tools necessary for some npm packages
RUN apk add --no-cache python3 g++ make

# Create a non-root user and set permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
# We use --chown to ensure the new user owns the files
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies as the non-root user
RUN npm install

# Copy the rest of the application code
COPY --chown=appuser:appgroup . .

# Build the React app for production
RUN npm run build

# === Stage 2: Serve the application with Nginx ===
FROM nginx:alpine as production-stage

# Copy the built files from the build-stage to the Nginx public directory
# We change the ownership to the nginx user
COPY --from=build-stage --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
