/**
 * Created by dharmendra on 21/12/16.
 */
"use strict";

var CronEmitter = require("cron-emitter").CronEmitter,
    moment = require('moment'),
    emitter = new CronEmitter(),
    db = require('src/db'),
    async = require('async'),
    eventReceiver = require('src/event-handler/pending-event-job');

emitter.add("*/30 * * * * *", "every_ten_seconds");


emitter.on("every_ten_seconds", function () {
    var currentTime = moment().unix();
    db.get('Nodes').findAll({})
        .then(function (nodes) {
            async.map(nodes || [], function (node, next) {
                checkServerHeartbeat(node, currentTime, next);
            }, function (err) {
            })
        })

});


function checkServerHeartbeat(node, currentTime, next) {
    var diff = (currentTime - node.last_ping )
    if (diff > 30) {
        db.get('Nodes').destroy({where: {id: node.id}})
            .then(function () {
                //processNewJob(next);
                eventReceiver.emit('check_cluster_heartbeat',node.cluster);
                next();
            })
    } else {
        next();
    }
}