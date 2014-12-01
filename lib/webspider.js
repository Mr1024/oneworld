var request = require('request');
var fs = require('fs');
request('http://boafanx.tabboa.com/free/', function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var str = parse(body);
        fs.writeFile('./config.json', str, function(err) {
            console.log('已保存');
        });
    }
})
var groupreg = /<code>([^<]*?)(?=<\/code>)/g;
var reg = /(?:SSH.*?：)(.*?)(?=[\n\r])/gi;

function parse(html) {
    var t = html.match(groupreg);
    var dataArry = {};
    t.forEach(function(item) {
        var data = {};
        for (var i = 1; reg.exec(item) != null; i++) {
            var value = RegExp.$1;
            switch (i) {
                case 1:
                    data["host"] = value;
                    break;
                case 2:
                    data["port"] = parseInt(value);
                    break;
                case 3:
                    data["username"] = value;
                    break;
                case 4:
                    data["password"] = value;
                    dataArry[data["host"]] = data;
                    break;
            }
        }
    });
    return JSON.stringify(dataArry);
}
