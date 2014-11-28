#!/usr/bin/env node

var socks = require('socksv5'),
    Connection = require('ssh2'),
    fs = require('fs'),
    ping = require('ping-net'),
    ssh_config,
    sockerserver;

fs.readFile('./lib/config.json', {
    "encoding": "utf8"
}, function(err, data) {
    if (!err) {
        var data = JSON.parse(data);
        var options = [];
        for (var item in data) {
            options.push({
                address: item,
                port: data[item].port
            });
        }
        ping.ping(options, function(result) {
            var resultdata = result[0];
            if (!isNaN(resultdata.avg)) {
                ssh_config = data[resultdata.address];
                server();
            }

        }, true);
    }
});

function server() {
    sockerserver && sockerserver.close();
    sockerserver = socks.createServer(function(info, accept, deny) {
        var conn = new Connection();
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
            //conn.connect(ssh_config);
            //deny();
        });
        conn.connect(ssh_config);
    });
    sockerserver.listen(7070, '127.0.0.1', function() {
        console.log('SOCKSv5 proxy server started on port 7070');
    });
    sockerserver.useAuth(socks.auth.None());
}
