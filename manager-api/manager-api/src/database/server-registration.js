/**
 * Created by dharmendra on 15/12/16.
 */


'use strict';


var
    moment = require('moment'),
    M = require('src/database'),
    log = require('src/utils/logger')(module);

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('server_registration', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        cluster_name: {
            type: 'VARCHAR',
            field: 'cluster_name'
        },
        queue: {
            type: 'VARCHAR',
            field: 'queue_name'
        },
        status: {
            type: DataTypes.BOOLEAN,
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
       /* classMethods: {
            allocateServerJobs: function (fileCount, cb) {
                var allocateServer;
                return sequelize.transaction(function (t) {
                    return M.get('ServerJob').findOne(
                        {
                            where: {
                                file_count: 0
                            }
                        }, {transaction: t})
                        .then(function (serverJob) {
                            //console.log(' Server ============>',server);
                            allocateServer = serverJob;
                            return M.get('ServerJob').update({
                                file_count: fileCount
                            }, {
                                where: {id: serverJob.id}
                            }, {transaction: t})
                                .then(function () {
                                }
                            )
                        });
                }).then(function (result) {
                    return cb(null, allocateServer);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            },
            createCluster: function (server, cb) {
                return sequelize.transaction(function (t) {
                    return M.get('ServerReg').create(server, {transaction: t})
                        .then(function () {
                            var serverjob = M.get('ServerJob');
                            serverjob.cluster_name = server.cluster_name;
                            serverjob.queue = server.queue;
                            serverjob.job_count = 0;
                            serverjob.start_on = moment().unix();
                            return M.get('ServerJob').create(serverjob, {transaction: t}).then(function () {
                                }
                            )
                        });
                }).then(function (result) {
                    return cb(null, server);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            }

        }*/
    });
}