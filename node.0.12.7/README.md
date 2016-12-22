# Build Docker images
docker build -t node-api .

# Run Docker images

# Create docker service in Swarm on Node 01 (A)
docker service create --name node01_api -e RABBIT_HOST=172.31.43.109 -e RABBIT_PORT=5672 -e MYSQL_IP=172.31.43.109 -e MYSQL_USER=admin \
       -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_PORT=3306 -e MYSQL_DBNAME=cavodb -e CLUSTER_NAME=cavo1 -e QUEUE=MessageQ node-api <Branch_Name> <git_Personal_access_tokens>

#Create docker service in Swarm on Node 02 (B)
docker service create --name node02_api -e RABBIT_HOST=172.31.43.109 -e RABBIT_PORT=5672  -e MYSQL_IP=172.31.43.109 -e MYSQL_USER=admin \
       -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_PORT=3306 -e MYSQL_DBNAME=cavodb -e CLUSTER_NAME=cavo2 -e QUEUE=MessageQ2 node-api <Branch_Name> <git_Personal_access_tokens>


