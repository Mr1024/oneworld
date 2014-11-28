var request = require('request');
request('http://boafanx.tabboa.com/free/', function(error, response, body) {
    if (!error && response.statusCode == 200) {
    	parse(body)
    }
})
var groupreg = /<code>.*?<\/code>/g;
var reg = /SSH.*?：(.*)$/mg;

function parse(html) {
	var t = html.match(groupreg);
	console.log(t);
}
