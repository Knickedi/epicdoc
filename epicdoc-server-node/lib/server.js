
module.exports = (function() {
	var dispatcher = require('./request-dispatcher');

	return {
		start: function(config) {
			var server = require("http").createServer(function(request, response) {
				var url = request.url.toLowerCase(),
					handled = false;
				
				for (var path in dispatcher) {
					if (url.substring(0, path.length) == path.toLowerCase()) {
						console.log('Handling request for ' + path);
						dispatcher[path](request, response, config);
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
				console.error('Failed to start server:', e.message);
			});
			server.on('listening', function() {
				console.log('EpicDoc server listening on port ' + config.port + ' ...');
			});
			
			server.listen(config.port);
		}
	};
})();
