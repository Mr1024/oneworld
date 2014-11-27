#!/usr/bin/env node

var socks = require('socksv5'),
    Connection = require('ssh2'),
    fs = require('fs'),
    ping = require('tcp-ping');
var serverArry = [];
fs.readFile('./lib/config.json', {
    "encoding": "utf8"
}, function(err, data) {
    if (!err) {
        var data = JSON.parse(data);
        for (var item in data) {
            ping.ping({
                address: item,
                port: data[item].port
            }, function(err, data) {
                if(!err){
                  console.log(data);
                  serverArry.push(data);
                }
            });
            console.log(serverArry);
        }
    }
});
var ssh_config = {
    host: '23.95.57.193',
    port: 1309,
    username: 'boa',
    password: 'eyo3'
};

socks.createServer(function(info, accept, deny) {
    var conn = new Connection();
    console.log(info);
    conn.on('ready', function() {
        conn.forwardOut(info.srcAddr,
            info.srcPort,
            info.dstAddr,
            info.dstPort,
            function(err, stream) {
                if (err)
                    return deny();

                var clientSocket;
                if (clientSocket = accept(true)) {
                    stream.pipe(clientSocket).pipe(stream).on('close', function() {
                        conn.end();
                    });
                } else
                    conn.end();
            });
    }).on('error', function(err) {
        console.log(err);
        deny();
    });
    conn.connect(ssh_config);
}).listen(7070, '127.0.0.1', function() {
    console.log('SOCKSv5 proxy server started on port 7070');
}).useAuth(socks.auth.None());
