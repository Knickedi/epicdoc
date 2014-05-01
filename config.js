
/*
	Epicdoc application configuration.
	You can use epicdoc without any configuration, nevertheless there are some options available
	and this file will document them. Actually you can include the configuration in your index.html
	directly, you don't need a separate file for that. Just make sure to define the configuration
	before the epicdoc javascript file inclusion.
*/
epicconfig = {

	/*
		Debug mode (for developers).
		This flag will tell the application to provide some additional information.
		E.g. the console will print more information (usually it will print info warning and error
		only).
	*/
	debug: true,
	
	/*
		The documentation will be openened in read-only mode.
		This config is good for documentation distribution.
	*/
	// readonly: false,
	
	/*
		Application language.
		If the given langauge is not available, then "en" will always be the fallback.
	*/
	// language: 'en',
	
	server: {
		
		/*
			Disable server communication (default false).
		*/
		//disabled: false,
		
		/*
			Epicdoc server port (default 54321).
			You can change it, if this port is already used by another aplication on your machine.
			You have to start the node epicdoc server with that port then:
			epicdoc --server --port YOUR_PORT
		*/
		// port: 54321
		
		/*
			Path to data.js.
			Usually your data.js is located next to your index.html. Epicdoc will extract this path
			from your local URL e.g. file:///home/myhome/index.html becomes /home/myhome.
			If this is not the case you can change the location which is sent to the server here.
		*/
		// dataPath: 'path/to/dir/with/data/'
		
	}
};
