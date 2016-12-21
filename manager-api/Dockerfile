FROM nginx
RUN apt-get update
RUN chown www-data:www-data -R /usr/share/nginx/html
# RUN mv /etc/nginx/conf.d/default.conf
ADD default1.conf /etc/nginx/conf.d/

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 0.12.7

RUN apt-get update

RUN apt-get install -y -q --no-install-recommends apt-transport-https build-essential \
    ca-certificates curl g++ gcc git libcurl3 libcurl3-dev php5-curl libcairo2-dev \
    libcurl4-openssl-dev libgif-dev libicu-dev libssl-dev make libpq-dev rsync \
    rsyslog software-properties-common sudo wget vim

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install nvm with node and npm
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Set up our PATH correctly so we don't have to long-reference npm, node, &c.
ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm install pm2 -g

ADD manager-api /manager-api
ADD run.sh /run.sh

RUN chmod +x /run.sh
# RUN /run.sh
ENTRYPOINT ["/bin/bash", "/run.sh"]
