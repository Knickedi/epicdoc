
var args = require('./lib/args-reader');

if (args.prepare()) {
	require('./lib/server').start(args.get());
}
