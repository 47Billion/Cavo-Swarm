/**
 * Created by dharmendra on 21/12/16.
 */

'use strict';

var moment = require('moment'),
    M = require('src/db'),
    log = require('src/utils/logger')(module);

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('nodes', {
        id: {
            type: 'SERIAL',
            field: 'id',
            autoIncrement: true,
            primaryKey: true
        },
        hostname: {
            type: 'VARCHAR',
            field: 'hostname'
        },
        cluster: {
            type: 'VARCHAR',
            field: 'cluster'
        },
        start_on: {
            type: DataTypes.BIGINT,
            field: 'start_on'
        },
        last_ping: {
            type: DataTypes.BIGINT,
            field: 'last_ping'
        }
    }, {
        freezeTableName: true,
        classMethods: {}
    });
}
