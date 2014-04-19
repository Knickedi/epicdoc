
var http = require("http");
var fs = require('fs');
var qs = require('querystring');

// handlers for incoming requests for a certain path ----------------------------------------------

var commands = {
	'/LiveUpdater/Test': function(request, response) {
		writeCORSHeader(response);
		response.writeHead(200);
		response.write('EpicDoc-Test');
		response.end();
	},
	'/LiveUpdater/Update': function(request, response) {
		processPost(request, response, function(body) {
			writeCORSHeader(response);
			response.writeHead(200);
			
			var json;
			
			try {
				json = JSON.parse(body.data);
			} catch (e) {
			}
			
			if (!json) {
				return response.end('Invalid JSON in data parameter');
			}
			
			try {
				fs.writeFile(body.path, 'epicdata = ' + JSON.stringify(json, null, 4), function(e) {
					if (e) {
						response.end('Failed to write to given path: ' + (body.path || ''));
					} else {
						response.end('EpicDoc-Update');
					}
				}); 
			} catch (e) {
				response.end('Failed to write to given path: ' + (body.path || ''));
			}
		});
	},
};


// read application arguments ---------------------------------------------------------------------

var args = require('optimist')
	.default('port', 54321).
	argv;
	
var port = args.port;


// helpers for request processing -----------------------------------------------------------------

function processPost(request, response, success) {
	var method = request.method.toLowerCase();
	
	 if (method == 'post') {
        var body = '';
        
        request.on('data', function (data) {
            body += data;
        });
        
        request.on('end', function () {
        	try {
        		body = qs.parse(body);
        		
        		if (!body) {
        			throw 'No body';
        		}
        		
        		success(body);
        	} catch (e) {
                response.writeHead(400);
                response.end('Invalid POST body');
        	}
        });
	} else if (method == 'options') {
		writeCORSHeader(response);
		response.end();
    } else {
        response.writeHead(405);
        response.end('Expected POST request (not ' + request.method + ')');
    }
}

function writeCORSHeader(response) {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
}

// start HTTP server ------------------------------------------------------------------------------

var server = http.createServer(function(request, response) {
	var url = request.url.toLowerCase(),
		handled = false;
	
	for (var path in commands) {
		if (url.substring(0, path.length) == path.toLowerCase()) {
			console.log('Handling request for ' + path);
			commands[path](request, response);
			return;
		}
	}
	
	if (!handled) {
		console.log('Invalid request for ' + url);
		response.writeHead(400);
		response.end('Request path \'' + url + '\' has no function');
	}
});
server.on('error', function(e) {
	console.log('Failed to start server:', e.message);
});
server.on('listening', function() {
	console.log('EpicDoc server listening on port ' + port + ' ...');
});
server.listen(port);
