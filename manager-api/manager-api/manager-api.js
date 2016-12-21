'use strict';

require('rootpath')();


process.setMaxListeners(0);

var src = require('src'),
    config = require('config'),
    argh = require('argh').argv,
    colors = require('colors'),
    log = require('src/utils/logger')(module);


// uncaught exception
process.on('uncaughtException', function (err) {
    log.error('uncaughtException:', err.message);
    log.error(err.stack);
});

var port = +argh.port || config.app.port, //PORT
    host = +argh.host || config.app.host; //HOST

log.info(colors.green('         **** DEVELOPMENT MODE ****       '));


src.start(host, port);
