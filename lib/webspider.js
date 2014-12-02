var request = require('request');
var fs = require('fs');
exports.connServer = function(callback) {
    request({
        uri: 'http://boafanx.tabboa.com/free/',
        headers: {
            "Host": "boafanx.tabboa.com",
            "Connection": "keep - alive",
            "Pragma": "no - cache",
            "Cache - Control": "no - cache",
            "Accept": "text / html, application / xhtml + xml, application / xml;q = 0.9, image / webp, */*;q=0.8",
            "User - Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36",
            "Accept - Encoding": "gzip, deflate, sdch",
            "Accept - Language": "zh-CN,zh;q=0.8",
            "Cookie": "PHPSESSID=796motli79euahbjifrqcj7rr5; Hm_lvt_11ed59c7dea4b08cc9bcbee9548cb74c=1417046572,1417151540,1417396407,1417480100; Hm_lpvt_11ed59c7dea4b08cc9bcbee9548cb74c=1417480100"
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var str = parse(body);
            fs.writeFile('./config.json', str, function(err) {
                console.log('Access to configuration data successfully');
                if (callback !== undefined && Object.prototype.toString.call(callback) === '[object Function]') {
                    callback();
                }
            });
        }
    })
}

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
