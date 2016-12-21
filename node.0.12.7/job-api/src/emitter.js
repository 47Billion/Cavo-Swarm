/**
 * Created by dharmendra on 21/12/16.
 */
"use strict";

var request = require('request'),
    CronEmitter = require("cron-emitter").CronEmitter,
    config = require('config'),
    moment = require('moment'),
    emitter = new CronEmitter(),
    os = require('os'),
    now = new Date();

emitter.add("*/10 * * * * *", "every_ten_seconds");


emitter.on("every_ten_seconds", function () {
    /*
     {
     "hostname" : "value" ,
     "cluster" : "value",
     "last_ping": timestamp in unix,
     }
     */
    request.post(config.rest.serverStatusUrl, {
        body: {
            "hostname": os.hostname(),
            "cluster": process.env['CLUSTER_NAME'],
            "last_ping": moment().unix()
        },
        json: true
    }, function (err) {
        console.log('=>Error', err)
    });
});