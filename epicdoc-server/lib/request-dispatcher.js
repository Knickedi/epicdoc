
module.exports = (function() {

	var fs = require('fs'),
		path = require('path'),
		utils = require('./http-utils');
	
	return {
	
		'/test': function(request, response, appArgs) {
			utils.writeCORSHeader(response);
			response.writeHead(200);
			response.write('EpicDoc-Test');
			response.end();
		},
		
		'/data': function(request, response, appArgs) {
			utils.processPost(request, response, function(body) {
				utils.writeCORSHeader(response);
				
				var json;
				
				try {
					json = JSON.parse(body.data);
				} catch (e) {
				}
				
				if (!json) {
					return response.end('Invalid JSON in data parameter');
				}
				
				var dataFile = path.join(appArgs['root-path'], 'data.js');
				
				try {
					fs.writeFile(dataFile, 'epicdata = ' + JSON.stringify(json, null, 4), function(e) {
						if (e) {
							console.log(e);
							response.writeHead(500);
							response.end('Failed to write to given path: ' + dataFile);
						} else {
							response.writeHead(200);
							response.end('EpicDoc-Data');
						}
					}); 
				} catch (e) {
					response.writeHead(500);
					response.end('Failed to write to given path: ' + dataFile);
				}
			});
			
		},
	}

})();