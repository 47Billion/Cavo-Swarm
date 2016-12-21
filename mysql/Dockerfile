FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y  mysql-server

RUN sed -i -e"s/^bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" /etc/mysql/my.cnf

ADD run.sh /run.sh
ADD dump.sql /dump.sql
RUN chmod +x /run.sh

ENTRYPOINT ["/bin/bash", "/run.sh"]
