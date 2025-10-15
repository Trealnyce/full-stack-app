# Use a lean Nginx image to serve the static content
FROM nginx:alpine

# Copy the custom Nginx configuration file to the correct directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the frontend files to the Nginx web root
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80 to the outside world
EXPOSE 80