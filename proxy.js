#!/usr/bin/env node

var socks = require('socksv5'),
    Connection = require('ssh2'),
    fs = require('fs'),
    cluster = require('cluster'),
    os = require('os'),
    ping = require('ping-net'),
    webspider = require('./lib/webspider'),
    ssh_config,
    numCPUs = os.cpus().length,
    workers = {};
if (cluster.isMaster) {
    cluster.on('death', function(worker) {
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        workers[worker.pid] = worker;
    }
} else {
    init();
}
process.on('SIGTERM', function() {
    for (var pid in workers) {
        process.kill(pid);
    }
    process.exit(0)
})


function init() {
    console.log("Initializing data, please wait·······");
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
            if (options.length == 0) {
                webspider.connServer(init);
            }
            ping.ping(options, function(result) {
                var resultdata = result[0];
                if (!isNaN(resultdata.avg)) {
                    ssh_config = data[resultdata.address];
                    server();
                } else {
                    webspider.connServer(init);
                }

            }, true);
        } else {
            webspider.connServer(init);
        }
    });
}

function server() {
    var conn = new Connection();
    conn.on('ready', function() {
        console.log("SSH is ready······");
        socks.createServer(function(info, accept, deny) {
            conn.forwardOut(info.srcAddr,
                info.srcPort,
                info.dstAddr,
                info.dstPort,
                function(err, stream) {
                    if (err) {
                        return deny();
                    }
                    var clientSocket;
                    if (clientSocket = accept(true)) {
                        stream.pipe(clientSocket).pipe(stream).on('close', function() {

                        });
                    } else {
                        console.log("deny");
                        deny();
                        conn.end();
                        webspider.connServer(init);
                    }
                });

        }).listen(7070, 'localhost', function() {
            console.log('->SOCKSv5 proxy server started on port 7070······');
        }).useAuth(socks.auth.None());
    }).on('error', function(err) {
        console.log(err);
        conn.end();
        webspider.connServer(init);
    });
    conn.connect(ssh_config);
}
setInterval(function() {
    webspider.connServer();
}, 432000000);
