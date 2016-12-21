# Build docker image
docker build -t mysql_server .

# Run docker image
docker run -d --name mysql-server -e MYSQL_USER=admin -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_DBNAME=cavodb -p 3306:3306 mysql_server
