'use strict';


var express = require('express'),
    async = require('async'),
    log = require('src/utils/logger')(module),
    Client = require('node-rest-client').Client,
    config = require('config'),
    os = require("os"),
    emitter = require("src/emitter");

var client = new Client();
var name = process.env.CLUSTER_NAME, queue = process.env.QUEUE, hostName = os.hostname();
var args = {
    data: {
        "name": name,
        "queue": queue,
        "hostName": hostName
    },
    headers: {"Content-Type": "application/json"}
};


module.exports.start = function () {
    function _registerServer(next) {
        client.post(config.rest.registration, args, function (data, response) {
            next();
        });
    }

    function _workerPolling(next) {
        require('src/rabbitmq/rabbit').start();
        next();
    }

    async.waterfall([
        _registerServer,
        _workerPolling
    ], function onServerInit(err) {
        log.info('=>onServerInit', err);
    });

};