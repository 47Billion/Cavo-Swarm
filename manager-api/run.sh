cd /manager-api
npm install
pm2 start manager-api.js

# Download zip file
cd /usr/share/nginx/html/
git clone https://github.com/softrobin5/zip-files.git .

# Start Nginx
nginx -g 'daemon off;'
