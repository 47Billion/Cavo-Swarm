/**
 * Created by dharmendra on 15/12/16.
 */


'use strict';


var
    moment = require('moment'),
    M = require('src/database'),
    log = require('src/utils/logger')(module);

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('server_jobs', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        cluster_name: {
            type: DataTypes.INTEGER,
            field: 'cluster_name'
        },
        file_count: {
            type: DataTypes.INTEGER,
            field: 'file_count'
        },
        start_on: {
            type: DataTypes.BIGINT,
            field: 'start_on'
        },
        stop_on: {
            type: DataTypes.BIGINT,
            field: 'stop_on'
        },
        queue: {
            type: 'VARCHAR',
            field: 'queue_name'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            updateCount: function (req, cb) {
                var count;
                return sequelize.transaction(function (t) {
                    return M.get('ServerJob').findOne(
                        {
                            where: {
                                cluster_name: req.body.instance
                            }
                        }, {transaction: t})
                        .then(function (serverJob) {
                            console.log(' Server ============>',serverJob);
                            //allocateServer = serverJob;
                            count = serverJob.file_count - 1;
                            return M.get('ServerJob').update({
                                file_count: count
                            }, {
                                where: {
                                    cluster_name: req.body.instance
                                    //file_count: serverJob.file_count
                                }
                            }, {transaction: t})
                                .then(function () {
                                }
                            )
                        });
                }).then(function (result) {
                    return cb(null, count);
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            },
            updateCount1: function (req, cb) {
                    sequelize.query("update server_jobs set file_count = server_jobs.file_count - 1 where cluster_name = '" +  req.body.instance +"';" ,
                    {type: sequelize.QueryTypes.RAW})
                    .then(function (data) {
                        //log.debug('=>fetchOffersForDriver', data);
                        return cb(null,'');
                    }, function (err) {
                        log.error('=>fetchOffersForDriver', err);
                        cb({
                            message: 'Failed to  execute query at fetchOffersForDriver'
                            //code: C.ERRORS.REQUEST_FAILED
                        });
                    });
            }
        }
    });
}