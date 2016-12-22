/**
 * Created by dharmendra on 21/12/16.
 */

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var rabbit = require('src/queue/rabbit'),
    db = require('src/db'),
    log = require('src/utils/logger')(module);

var server = new EventEmitter2({
    maxListeners: 99999
});
server.on('process_next_job', function () {
    processNextJob();
});

server.on('check_cluster_heartbeat', function (cluster) {
    checkServerStatus(cluster);
});

var checkServerStatus = function checkServerStatus(cluster) {
    log.info(" checkServerStatus ==========> ", cluster);
    var nodeServer = db.get('Nodes');
    db.get('Nodes').findOne({
        where: {
            cluster: cluster
        }
    }).then(function (node) {
        if (!node) {
            db.get('Clusters').update({
                status: -1 // Booting
            }, {
                where: {
                    name: cluster,
                    status: 0
                }
            }).then(function () {
                }
            )
        }
    })
}

var processNextJob = function processNextJob() {
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
                    if (server && server.queue) {
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
                                });
                            });
                        });
                    } else {
                    }
                });
            } else {
            }
        });
}

module.exports = server
;