/**
 * Created by dharmendra on 15/12/16.
 */

var express = require("express");
var mysql = require('mysql'),
    log = require('src/utils/logger')(module);
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'manager'
});
var app = express();

connection.connect(function (err) {
    if (!err) {
        log.info("Database is connected ... \n\n");
    } else {
        log.info("Error connecting database ... \n\n", err);
    }
});


var getDBConnection = function getDBConnection() {
    return connection;
};

var executeQuery = function executeQuery(sql, next) {
    log.info(" sql ==============>", sql);
    connection.query(sql, function (err, rows, fields) {
        //connection.end();
        if (!err) {
            log.info('The solution is: ', rows);
            next(null, rows);
        }
        else {
            log.info('Error while performing Query.');
            next(err);
        }
    });
};

var db = {
    getDBConnection: getDBConnection,
    executeQuery: executeQuery
}

module.exports = db;
