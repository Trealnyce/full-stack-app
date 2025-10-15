# Use an official Nginx image as a base
FROM nginx:alpine

# Copy the Nginx configuration file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static web files (HTML, CSS, JS) into the Nginx public directory
COPY . /usr/share/nginx/html