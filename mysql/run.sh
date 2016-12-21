#!/bin/bash
/usr/bin/mysqld_safe &
sleep 5

MYSQL_IP=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')

mysql -uroot -e "CREATE DATABASE $MYSQL_DBNAME;" 2> /tmp/error1
STATUS=$?
if [ $STATUS -eq 0 ];
  then
        echo -e "Database '$DBNAME' is created"
	echo "CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_ROOT_PASSWORD';" | mysql
	echo "GRANT ALL PRIVILEGES ON * . * TO '$MYSQL_USER'@'%';" | mysql
	echo "FLUSH PRIVILEGES" | mysql
        mysql -h$MYSQL_IP -u$MYSQL_USER -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE $MYSQL_DBNAME"
        mysql -h$MYSQL_IP -u$MYSQL_USER -p$MYSQL_ROOT_PASSWORD $MYSQL_DBNAME < /dump.sql

elif (grep -i "^ERROR 1007" /tmp/error1 > /dev/null);
  then
       echo -e "Database '$DBNAME' already exists"
else
       echo -e "Failed to create database '$DBNAME'"
fi


tail -f /etc/issue 
