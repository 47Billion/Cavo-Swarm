/**
 * Created by dharmendra on 21/12/16.
 */

'use strict';

var moment = require('moment'),
    M = require('src/db'),
    log = require('src/utils/logger')(module);

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('jobs', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        anchor: {
            type: 'VARCHAR',
            field: 'anchor'
        },
        case_name: {
            type: 'VARCHAR',
            field: 'case_name'
        },
        source: {
            type: 'VARCHAR',
            field: 'source'
        },
        submitted_on: {
            type: 'VARCHAR',
            field: 'submitted_on'
        },
        state: {
            type: DataTypes.INTEGER,
            field: 'state'
        },
        cluster: {
            type: 'VARCHAR',
            field: 'cluster'
        },
        queue: {
            type: 'VARCHAR',
            field: 'queue'
        },
        assigned_on: {
            type: DataTypes.BIGINT,
            field: 'assigned_on'
        },
        finished_on: {
            type: DataTypes.BIGINT,
            field: 'finished_on'
        },
        total_files: {
            type: DataTypes.BIGINT,
            field: 'total_files'
        },
        unprocessed_files: {
            type: DataTypes.BIGINT,
            field: 'unprocessed_files'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            updateJobCount: function (req, cb) {

                return sequelize.transaction(function (t) {
                    // chain all your queries here. make sure you return them.
                    return sequelize.query(" update jobs set unprocessed_files = jobs.unprocessed_files - 1 " +
                        " where queue = '" + req.body.queue + "' and  cluster = '" + req.body.name + "' and " +
                        " anchor = '" + req.body.job + "';",
                        {type: sequelize.QueryTypes.RAW, transaction: t})
                        .then(function (data) {
                            return sequelize.query("select unprocessed_files from jobs " +
                                " where queue = '" + req.body.queue + "' and  cluster = '" + req.body.name + "' and " +
                                " anchor = '" + req.body.job + "';",
                                {type: sequelize.QueryTypes.RAW, transaction: t})
                        })
                }).then(function (data) {
                    log.info('=>updateJobCount marked successfully');
                    return cb ? cb(null, data[0]) : null;
                }).catch(function (err) {
                    log.error('=>updateJobCount', err);
                    return cb ? cb({message: err.message ? err.message : err.toString()}) : null;
                });

            },
            releaseCluster: function (req, cb) {
                var allocateServer;
                return sequelize.transaction(function (t) {
                    return M.get('Clusters').update({
                        status: 0
                    }, {
                        where: {
                            name: req.body.name,
                            queue: req.body.queue
                        }
                    }, {transaction: t})
                        .then(function () {
                            return sequelize.query("update jobs set state = 2 " +
                                " ,finished_on = " + moment().unix() +
                                " where queue = '" + req.body.queue + "' and  cluster = '" + req.body.name + "' and " +
                                " anchor = '" + req.body.job + "';",
                                {type: sequelize.QueryTypes.RAW, transaction: t})
                                .then(function (data) {
                                }
                            );
                        }
                    )

                }).then(function (result) {
                    return cb(null, "");
                }).catch(function (err, exx) {
                    console.log('in catch errors', err, exx)
                    return cb(err);
                });
            }

        }
    });
}
