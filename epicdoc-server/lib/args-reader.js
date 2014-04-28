
module.exports = (function() {

	var fs = require('fs'),
		path = require('path');


	return {
	
		prepare: function() {
			var optimist = require('optimist')
				.usage('\nEpicDoc HTTP server which helps the EpicDoc HTML application to\n'
					+ 'run tasks a pure HTML application is not capable of.\n')
				.default({
					p: 54321,
					r: '../'
				})
				.boolean('h')
				.alias('p', 'port')
				.alias('h', 'help')
				.alias('r', 'root-path')
				.describe('h', 'this help page\n')
				.describe('p', 'http server port')
				.describe('r', 'path to EpicDoc application');
				
			this.args = optimist.argv;
			
			if (this.args.help) {
				optimist.showHelp(console.log);
				return false;
			}
			
			return this.prepareRootPath();
		},
		
		get: function() {
			return this.args;
		},
		
		
		
		prepareRootPath: function() {
			var filesToCheck = ['index.html', 'config.js', 'epicdoc'],
				rootPath = this.args['root-path'],
				checkedPath;
			
			if (this.filesExist(checkedPath = path.join(process.cwd(), rootPath), filesToCheck)) {
				this.args['root-path'] = checkedPath;
				return true;
			}
			
			if (this.filesExist(checkedPath = rootPath, filesToCheck)) {
				this.args['root-path'] = checkedPath;
				return true;
			}
			
			console.error('You have to specify a valid --root-path');
			console.error('Tried to search in parent directory of current working directory');
			console.error('But didn\'t find EpicDoc relevant files in there...');
			console.error('Searched for:', filesToCheck);
			console.error('(Try --help)');
			
			return false;
		},
		
		filesExist: function (filesPath, files) {
			for (var i = 0; i < files.length; i++) {
				if (!fs.existsSync(path.join(filesPath, files[i]))) {
					return false;
				}
			}
			
			return true;
		}
	}
	
})();