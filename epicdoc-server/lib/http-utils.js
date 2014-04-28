
module.exports = (function() {

	var qs = require('querystring');
	
	return {
		processPost: function(request, response, success) {
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
					} catch (e) {
						response.writeHead(400);
						response.end('Invalid POST body');
						return;
					}
					
					try {
						success(body);
					} catch (e) {
						console.error(e);
						response.writeHead(500);
						response.end('Failed to process post request');
					}
				});
			} else if (method == 'options') {
				this.writeCORSHeader(response);
				response.end();
			} else {
				response.writeHead(405);
				response.end('Expected POST request (not ' + request.method + ')');
			}
		},

		writeCORSHeader: function(response) {
			response.setHeader('Access-Control-Allow-Origin', '*');
			response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
		}
	};
	
})();
