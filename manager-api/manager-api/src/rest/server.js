/**
 * Created by dharmendra on 15/12/16.
 */
'use strict';
var log = require('src/utils/logger')(module);
var dbConnection = require('src/database/mysql'),
    moment = require('moment'),
    db = require('src/database');
var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var http = require('http');
var url = require('url');
var rabbit = require('src/rabbitmq/rabbit'),
    constant = require('src/utils/constant'),
    util = require('src/utils/util');


var register = function register(req, res, next) {
    log.info(" register ==========> ", req.body);
    var dbClusters = db.get('Clusters');
    log.info(" register ==========> ");
    dbClusters.name = req.body.name;
    dbClusters.queue = req.body.queue;
    db.get('Clusters').findOne(
        {
            where: {
                name: req.body.name,
                queue: req.body.queue
            }
        })
        .then(function (cluster) {
            if (!cluster) {
                dbClusters.status = 0;
                dbClusters.start_on = moment().unix();
                db.get('Clusters').createCluster(dbClusters, req, function (err, server) {
                    rabbit.startWorker(req.body.queue, next);
                    return res.status(200).json({
                        message: "Success"
                    });
                });
            } else {
                var node = db.get('Nodes');
                node.hostname = req.body.hostName;
                node.cluster = cluster.name;
                node.last_ping = moment().unix();
                //node.start_on = moment().unix();
                return db.get('Nodes').upsert(node).then(function () {
                        return res.status(200).json({
                            message: "Success"
                        });
                    }
                )

            }
        });
}

var deregister = function deregister(req, res, next) {
    log.info(" deregister ==========> ", req.body);
    var serverJobs = db.get('Jobs');
    serverJobs.updateJobCount(req, function (err, count) {
        console.log('=========> count ', count);
        if (count[0].unprocessed_files === 0) {
            serverJobs.releaseCluster(req, function (err, count) {
                processNewJob(next);
                return res.status(200).json({
                    message: "Success"
                });
            });
        } else {
            return res.status(200).json({
                message: "Success"
            });
        }
    });
}


var processNewJob = function processNewJob(next) {
    log.info(" processNewJob ==========> ");
    db.get('Jobs').findOne(
        {
            where: {
                state: 0
            }
        })
        .then(function (job) {
            if (job) {
                db.get('Clusters').processPendingJob(job, function (err, server) {
                    if (server.queue) {
                        var options = {
                            host: url.parse(server.path).host,
                            port: 80,
                            path: url.parse(server.path).pathname
                        };
                        http.get(options, function (res) {
                            var data = [], dataLen = 0;

                            res.on('data', function (chunk) {

                                data.push(chunk);
                                dataLen += chunk.length;

                            }).on('end', function () {
                                var buf = new Buffer(dataLen);
                                for (var i = 0, len = data.length, pos = 0; i < len; i++) {
                                    data[i].copy(buf, pos);
                                    pos += data[i].length;
                                }
                                var zip = new AdmZip(buf);
                                var zipEntries = zip.getEntries();
                                console.log(zipEntries.length);
                                rabbit.publishOnQueue("", server.queue, server.anchor, zipEntries, function (err, data) {
                                    next();
                                });


                            });
                        });
                    } else {
                        next();
                    }
                });
            } else {
                next();

            }
        });
}

var zipProcess = function zipProcess(req, response, next) {
    log.info(" register ==========> ", req.body);
    var hostUrl = req.body.url;
    var options = {
        host: url.parse(hostUrl).host,
        port: 80,
        path: url.parse(hostUrl).pathname
    };
    http.get(options, function (res) {
        var data = [], dataLen = 0;

        res.on('data', function (chunk) {

            data.push(chunk);
            dataLen += chunk.length;

        }).on('end', function () {
            var buf = new Buffer(dataLen);
            for (var i = 0, len = data.length, pos = 0; i < len; i++) {
                data[i].copy(buf, pos);
                pos += data[i].length;
            }
            var zip = new AdmZip(buf);
            var zipEntries = zip.getEntries();
            console.log(zipEntries.length);
            db.get('Clusters').allocateServerJobs(util.nextId(), hostUrl, zipEntries.length, function (err, server) {
                if (server.queue) {
                    rabbit.publishOnQueue("", server.queue, server.anchor, zipEntries, function (err, data) {
                        return response.status(200).json({
                            message: "Success"
                        });
                    });
                } else {
                    return response.status(200).json({
                        message: "Success"
                    });
                }

            });
        });
    });
}


var pingServer = function pingServer(req, res, next) {
    log.info(" pingServer ==========> ", req.body);
    var nodeServer = db.get('Nodes');

    db.get('Nodes').update({
        last_ping: req.body.last_ping
    }, {
        where: {
            cluster: req.body.cluster,
            hostname: req.body.hostname
        }
    }).then(function () {
            return res.status(200).json({
                message: "Success"
            });
        }
    )
}

var server = {
    register: register,
    deregister: deregister,
    zipProcess: zipProcess,
    pingServer: pingServer
};

module.exports = server;
