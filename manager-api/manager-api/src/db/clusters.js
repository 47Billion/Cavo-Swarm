/**
 * Created by dharmendra on 21/12/16.
 */

'use strict';

var moment = require('moment'),
    M = require('src/db'),
    log = require('src/utils/logger')(module),
    util = require('src/utils/util');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('clusters', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: 'VARCHAR',
            field: 'name'
        },
        queue: {
            type: 'VARCHAR',
            field: 'queue'
        },
        status: {
            type: DataTypes.INTEGER,
            field: 'status'
        },
        start_on: {
            type: DataTypes.BIGINT,
            field: 'start_on'
        },
        stop_on: {
            type: DataTypes.BIGINT,
            field: 'stop_on'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            allocateServerJobs: function (jobid, case_name, path, fileCount, cb) {
                var allocateServer;
                return sequelize.transaction(function (t) {
                    return M.get('Clusters').findOne(
                        {
                            where: {
                                status: 0
                            }
                        }, {transaction: t})
                        .then(function (cluster) {
                            if (cluster) {
                                return M.get('Clusters').update({
                                    status: 1
                                }, {
                                    where: {id: cluster.id}
                                }, {transaction: t})
                                    .then(function () {
                                        var jobs = M.get('Jobs');
                                        jobs.anchor = jobid;
                                        jobs.case_name = case_name;
                                        jobs.source = path;
                                        jobs.submitted_on = moment().unix();
                                        jobs.state = 1;
                                        jobs.cluster = cluster.name;
                                        jobs.queue = cluster.queue;
                                        jobs.assigned_on = moment().unix();
                                        jobs.total_files = fileCount;
                                        jobs.unprocessed_files = fileCount;
                                        allocateServer = jobs;
                                        return M.get('Jobs').create(jobs, {transaction: t}).then(function () {
                                            }
                                        )
                                    }
                                )
                            } else {
                                var jobs = M.get('Jobs');
                                jobs.anchor = jobid;
                                jobs.case_name = case_name;
                                jobs.source = path;
                                jobs.submitted_on = moment().unix();
                                jobs.state = 0;
                                //jobs.cluster = cluster.name;
                                //jobs.queue = cluster.queue;
                                jobs.assigned_on = moment().unix();
                                jobs.total_files = fileCount;
                                jobs.unprocessed_files = fileCount;
                                allocateServer = jobs;
                                return M.get('Jobs').create(jobs, {transaction: t}).then(function () {
                                    }
                                )
                            }
                        });
                }).then(function (result) {
                    return cb(null, allocateServer);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            },
            createCluster: function (clusters, req, cb) {
                return sequelize.transaction(function (t) {
                    return M.get('Clusters').create(clusters, {transaction: t})
                        .then(function () {
                            var node = M.get('Nodes');
                            node.hostname = req.body.hostName;
                            node.cluster = clusters.name;
                            node.last_ping = moment().unix();
                            node.start_on = moment().unix();
                            return M.get('Nodes').create(node, {transaction: t}).then(function () {
                                }
                            )
                        });
                }).then(function (result) {
                    return cb(null, cluster);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            },
            processPendingJob: function (job, cb) {
                var allocateServer = '';
                return sequelize.transaction(function (t) {
                    return M.get('Clusters').findOne(
                        {
                            where: {
                                status: 0
                            }
                        }, {transaction: t})
                        .then(function (cluster) {
                            //console.log(' Server ============>', cluster);

                            if (cluster) {
                                return M.get('Clusters').update({
                                    status: 1
                                }, {
                                    where: {id: cluster.id}
                                }, {transaction: t})
                                    .then(function () {
                                        allocateServer = job;
                                        return M.get('Jobs').update({
                                            state: 1
                                        }, {
                                            where: {anchor: job.anchor}
                                        }, {transaction: t}).then(function () {
                                        })
                                    }
                                )
                            } else {
                                allocateServer = '';
                            }
                        });
                }).then(function (result) {
                    return cb(null, allocateServer);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            }

        }
    });
}


