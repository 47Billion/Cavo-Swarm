/**
 * Created by dharmendra on 14/12/16.
 */

var amqp = require('amqplib/callback_api'),
    async = require('async'),
    config = require('config'),
    Client = require('node-rest-client').Client,
    os = require("os");

var client = new Client();
var queue = process.env.QUEUE;
var args = {
    data: {
        "name": process.env.CLUSTER_NAME,
        "queue": queue
    },
    headers: {"Content-Type": "application/json"}
};

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
function start() {
    amqp.connect("amqp://" + process.env.RABBIT_HOST + ":" + process.env.RABBIT_PORT + "?heartbeat=60", function (err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
        }
        conn.on("error", function (err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });
        conn.on("close", function () {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
        });

        console.log("[AMQP] connected");
        amqpConn = conn;

        whenConnected();
    });
}

function whenConnected() {
    //startPublisher();
    startWorker();
}

var pubChannel = null;
var offlinePubQueue = [];
function startPublisher() {
    amqpConn.createConfirmChannel(function (err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;
        while (true) {
            var m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
        }
    });
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {
    try {
        pubChannel.publish(exchange, routingKey, content, {persistent: true},
            function (err, ok) {
                console.log("[AMQP] publish", ok);
                if (err) {
                    console.error("[AMQP] publish", err);
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                }
            });
    } catch (e) {
        console.error("[AMQP] publish", e.message);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

// A worker that acks messages only if processed succesfully
function startWorker() {
    amqpConn.createChannel(function (err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });
        ch.prefetch(10);
        ch.assertQueue(queue, {durable: true}, function (err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume(queue, processMsg, {noAck: false});
            console.log("Worker is started");
        });
        function processMsg(msg) {
            setTimeout(function () {
            work(msg, function (ok) {
                try {
                    if (ok)
                        ch.ack(msg);
                    else
                        ch.reject(msg, true);
                } catch (e) {
                    closeOnErr(e);
                }
            });
            }, 5000);

        }
    });
}

function work(msg, cb) {
    console.log("Got msg ", msg.content.toString());
    //if (msg.content.toString() === 'END') {
    var data = msg.content.toString().split(' ');
    args.data.job = data[1];

    client.post(config.rest.degistration, args, function (data, response) {
        cb(true);
    });
    //} else {
    //    cb(true);
    //}
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}
module.exports.start = start;
