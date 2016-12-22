#!/bin/bash
echo "-------------------------->Start up script invoked<--------------------------"
# Set ENV $1
echo "export NODE_ENV=$1" |tee -a /etc/bash.bashrc
export NODE_ENV=$1

# git clone Cavo-Swarm
cd /var/www/api
git clone https://$2@github.com/47Billion/Cavo-Swarm.git .
git checkout $1
git pull
cd /var/www/api/manager-api/manager-api
npm install

echo "pm2 start manager-api.js"
pm2 start manager-api.js -i 1

# Download zip file
#cd /usr/share/nginx/html/
#git clone https://github.com/softrobin5/zip-files.git .

# cron

# Start Nginx
nginx -g 'daemon off;'
