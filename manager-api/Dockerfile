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

# ADD manager-api /manager-api
ADD start.sh /start.sh

RUN mkdir -p /var/www/api

# git repo crontab sh
RUN echo "* * * * * root /bin/bash /var/www/api/manager-api/cron.sh >> /var/log/cron.log 2>&1" >> /etc/crontab
# Create the log file to be able to run tail
RUN touch /var/log/cron.log

RUN apt-get -y autoclean && apt-get clean --quiet && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN chmod +x /start.sh

ENTRYPOINT ["/bin/bash", "/start.sh"]
