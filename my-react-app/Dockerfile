# === Stage 1: Build the React application ===
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Copy the locally installed node_modules folder
# This bypasses the npm install command during the Docker build
COPY node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# === Stage 2: Serve the application with Nginx ===
FROM nginx:alpine as final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]