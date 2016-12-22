#!/bin/bash
echo "-------------------------->Start up script invoked<--------------------------"
# Set ENV $1
echo "export NODE_ENV=$1" |tee -a /etc/bash.bashrc
export NODE_ENV=$1

# git clone Cavo-Swarm
cd /var/www/api
git clone https://$2@github.com/47Billion/Cavo-Swarm.git .
#git checkout $1
git pull
cd /var/www/api/node.0.12.7/job-api/
npm install

echo "pm2 start job-api.js"
pm2 start job-api.js -i 1

cd /var/www/api/node.0.12.7/job-api
npm install
pm2 start job-api.js

# cron

tail -f /etc/issue
