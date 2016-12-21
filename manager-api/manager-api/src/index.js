'use strict';


var express = require('express'),
    async = require('async'),
    log = require('src/utils/logger')(module),
    app = express();

var http = require('http').Server(app);

http.on('error', function (err) {
    log.error('HTTP Error', err.message);
    log.error(err.stack);
});

var initializedModels = require('src/database/init');
var models = require('src/database');
models.set(initializedModels, initializedModels.sequelize);
var rabbit = require('src/rabbitmq/rabbit').start();

app
    .use('/', require('src/rest')(app))

module.exports.start = function (host, port) {
    function _initServer(next) {
        http.listen(port, host, function () {
            log.info('HTTP Server is ready now @ ', host, ':', port);
            next();
        });
    }

    async.waterfall([
        _initServer
    ], function onServerInit(err) {
        log.info('=>onServerInit', err);
    });

};