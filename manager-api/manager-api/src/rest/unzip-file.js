/**
 * Created by dharmendra on 16/12/16.
 */
var file_url = 'http://localhost/images/test.zip';

var request = require('request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var http = require('http');
var url = require('url');



var options = {
    host: url.parse(file_url).host,
    port: 80,
    path: url.parse(file_url).pathname
};

http.get(options, function(res) {
    var data = [], dataLen = 0;

    res.on('data', function(chunk) {

        data.push(chunk);
        dataLen += chunk.length;

    }).on('end', function() {
        var buf = new Buffer(dataLen);

        for (var i=0, len = data.length, pos = 0; i < len; i++) {
            data[i].copy(buf, pos);
            pos += data[i].length;
        }

        var zip = new AdmZip(buf);
        var zipEntries = zip.getEntries();
        console.log(zipEntries.length)

        for (var i = 0; i < zipEntries.length; i++)
            console.log(zipEntries[i].entryName);
    });
});