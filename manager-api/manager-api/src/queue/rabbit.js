/**
 * Created by dharmendra on 14/12/16.
 */

var amqp = require('amqplib/callback_api'),
    async = require('async'),
    config = require('config');
//Setting max listeners to infinite.
process.setMaxListeners(0);


// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
function start() {
    console.log("amqp://" + process.env.RABBIT_HOST + ":" + process.env.RABBIT_PORT);
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
    startPublisher();
    //startWorker();
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
function startWorker(queue, next) {
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
            //ch.consume("jobs4", processMsg, {noAck: false});
            console.log("Worker is started");
        });

        next();
    });
}

function work(msg, cb) {
    console.log("Got msg", msg.content.toString());
    cb(true);
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

/*setInterval(function () {
 publish("", "jobs4", new Buffer("work work work"));
 publish("", "job123", new Buffer("work2 work3 work4"));
 }, 1000);*/


var publishOnQueue = function publishOnQueue(exchange, queueName, id, dataFiles, next) {
    //startWorker(queueName, function () {
    //    publish(exchange, queueName, new Buffer('START'));
    async.forEach(dataFiles, function (fileName, callback) {
        publish(exchange, queueName, new Buffer(fileName.entryName + ' ' + id));
        callback();
    }, function (err) {
        //publish(exchange, queueName, new Buffer('END'));
        next();
    });

    //});
}
module.exports.start = start;
module.exports.publishOnQueue = publishOnQueue;
module.exports.startWorker = startWorker;
