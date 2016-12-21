'use strict';

var config = require('config'),
    winston = require('winston'),
    moment = require('moment'),
    os = require("os");

winston.emitErrs = true;

var logger;

module.exports = function (_module) {
    var node = os.hostname() + '-' + process.pid + ' ';
    var getLabel = function (_module) {
        return 'manager-api';
        var parts = _module.filename.split('/');
        return parts[parts.length - 2] + '/' + parts.pop();
    };

    if (logger) {
        //logger.info('=>logger - reusing instance');
        return logger;
    }
    var transports = [];

    transports.push(new winston.transports.Console({
        label: getLabel(_module),
        level: 'debug',
        handleExceptions: config.logger.handleExceptions,
        json: false,
        colorize: true,
        timestamp: function () {
            return node + moment().format();
        }
    }));

    logger = new winston.Logger({
        transports: transports, exitOnError: false,
        exceptionHandlers: [
            new winston.transports.File({filename: config.logger.errorLogFile})
        ]
    });
    logger.info('=>logger - creating instance');
    return logger;
}
