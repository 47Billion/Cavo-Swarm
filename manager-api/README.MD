# Build Docker images
docker build -t manager-api .

# Run Docker images
docker run --restart=unless-stopped -d --name manager_api -e RABBIT_HOST=172.31.43.109 -e RABBIT_PORT=5672 \ 
            -e MYSQL_IP=172.31.43.109 -e MYSQL_USER=admin -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_PORT=3306 \
            -e MYSQL_DBNAME=cavodb -e CLUSTER_NAME=cavo1 -e QUEUE=MessageQ -p 80:80 -p 8080:8080 manager-api <Branch_Name> <git_Personal_access_tokens>
