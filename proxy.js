#!/usr/bin/env node

var socks = require('socksv5'),
    Connection = require('ssh2');

var ssh_config = {
    host: '63.141.248.218',
    port: 1308,
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
        deny();
    }).connect(ssh_config);
}).listen(7070, '127.0.0.1', function() {
    console.log('SOCKSv5 proxy server started on port 7070');
}).useAuth(socks.auth.None());
