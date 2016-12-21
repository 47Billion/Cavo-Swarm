'use strict'

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    router = express.Router(),
    server = require('src/rest/server');


var BASE_URL = '/rest/';

router.post(BASE_URL + 'v1/registration', server.register);
router.post(BASE_URL + 'v1/deregister', server.deregister);
router.post(BASE_URL + 'v1/zip/process', server.zipProcess);
router.post(BASE_URL + 'v1/node/heartbeat', server.heartbeat);
router.get(BASE_URL + 'v1/job/:anchor/status', server.jobStatus);
router.get(BASE_URL + 'v1/processors', server.processor);

module.exports = function (app) {
    app
        .use(require('morgan')('combined', {"sipseam": logger.stream}))
        .use(bodyParser.json({limit: '5mb'}))
        .all('/*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Credentials', true);
            res.header('Authorization', true);
            res.header('Access-Control-Allow-Headers', 'Content-type,X-Requested-With,Accept, Authorization');
            req.headers['content-type'] = req.headers['content-type'] || 'application/json';
            if (req.method == 'OPTIONS') {
                res.status(200).end();
            } else {
                next();
            }
        })
        .use(bodyParser.urlencoded({extended: false}));

    return router;
}

