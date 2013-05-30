
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , fs   = require('fs')
  , path = require('path');

var jsdom = require('jsdom').jsdom;

var app = express();
var total_iter = 0;

if (fs.existsSync('searches.count'))
	total_iter = parseInt(fs.readFileSync('searches.count'));

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/generate', function(req, res)
{
	start(function(url, html)
	{
		if (++total_iter%5 == 0) {
			fs.writeFile('searches.count', total_iter);
		}

		res.json({url: url, html: html, total_iter: total_iter});
	})
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});



function start(cbk)
{
	// generate a random path
	var url = Math.random().toString(36).substring(2,6);

	makeRequest(url, function(alive, url, content)
	{
		if (!alive) {
			setTimeout(function()
			{
			start(cbk);
			}, 
			100);
		}
		else {
			jsdom.env(
				content,
				["http://code.jquery.com/jquery.js"],
				function (errors, window) {
					var html = window.$("#viewport > section").html();
					window.close();

					if (html == undefined)
						start(cbk);
					else
						cbk(url, html);
				})
		}
	})
}

function makeRequest(path, callback)
{
	var opts =
	{
		host: "d.pr",
		path: "/a/" + path
	};

	var content = '';

	var req = http.request(opts, function(res)
	{
		res.on('data', function(chunk) {
			content += chunk;
		})

		res.on('end', function() {
			if (res.statusCode == 200) {
				callback(true, "http://d.pr/a/" + path, content);
				return;
			}
			else
				callback(false, null, null);
		})
	});

	req.end();
}
