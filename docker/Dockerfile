FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy HTML file and nginx config
COPY index.html .
COPY nginx.conf /etc/nginx/nginx.conf

# Debug: create a test file and list directory contents
RUN echo "<html><body><h1>Test File</h1></body></html>" > test.html
RUN ls -la /usr/share/nginx/html/
RUN cat /etc/nginx/nginx.conf

# Expose port and start nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]