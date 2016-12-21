/**
 * Created by dharmendra on 15/12/16.
 */
'use strict';
var log = require('src/utils/logger')(module);
var moment = require('moment'),
    db = require('src/db');
var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var http = require('http');
var url = require('url');
var rabbit = require('src/queue/rabbit'),
    constant = require('src/utils/constant'),
    util = require('src/utils/util'),
    eventReceiver = require('src/event-handler/pending-event-job');


var register = function register(req, res, next) {
    log.info(" register ==========> ", req.body);
    var dbClusters = db.get('Clusters');
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
                node.start_on = moment().unix();
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
        if (count[0].unprocessed_files === 0) {
            serverJobs.releaseCluster(req, function (err, count) {
                //processNewJob(next);
                eventReceiver.emit('process_next_job');
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


var zipProcess = function zipProcess(req, response, next) {
    log.info(" register ==========> ", req.body);
    var hostUrl = req.body.source;
    var case_name = req.body.case;
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
            var anchor = util.nextId();
            db.get('Clusters').allocateServerJobs(anchor,case_name, hostUrl, zipEntries.length, function (err, server) {
                if (server.queue) {
                    rabbit.publishOnQueue("", server.queue, server.anchor, zipEntries, function (err, data) {
                        return response.status(200).json({
                            message: "Success",
                            jobId: anchor
                        });
                    });
                } else {
                    return response.status(200).json({
                        message: "Success",
                        jobId: anchor
                    });
                }

            });
        });
    });
}


var heartbeat = function heartbeat(req, res, next) {
    log.info(" heartbeat ==========> ", req.body);
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

var jobStatus = function jobStatus(req, res, next) {
    var anchor = req.params.anchor;
    var nodeServer = db.get('Nodes');
    db.get('Jobs').findOne({
        where: {
            anchor: anchor
        }
    }).then(function (data) {
            if (data) {
                if (data.state === 0) {
                    data.state = 'Submitted'
                } else if (data.state === 1) {
                    data.state = 'Processing'
                }if (data.state === 2) {
                    data.state = 'Finished'
                }
                if(data. assigned_on){
                    data.assigned_on = moment(data.assigned_on * 1000).format('MMMM Do YYYY, h:mm:ss a');
                }
                if(data. finished_on){
                    data.assigned_on = moment(data.finished_on * 1000).format('MMMM Do YYYY, h:mm:ss a');
                }
                return res.status(200).json(data
                );
            } else {
                return res.status(200).json({
                    message: "No data found"
                });
            }
        }
    )
}

var server = {
    register: register,
    deregister: deregister,
    zipProcess: zipProcess,
    heartbeat: heartbeat,
    jobStatus: jobStatus
};

module.exports = server;
