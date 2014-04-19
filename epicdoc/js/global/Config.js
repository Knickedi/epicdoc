
Ext.define('ED.Config', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.util.Observable',
	singleton: true,
	
	// PUBLIC ----------------------------------------------------------------------------------------
	
	// INITIALIZATION --------------------------------------------------------------------------------
	
	constructor: function() {
		var me = this;
		
        me.callParent();
		me.addEvents();
	},
	
	init: function(callback) {
		var me = this;
		
		me.config = ED.util.JS.getValue(window, 'epicconfig', 'object', {});
		
		['string', 'object', 'number', 'boolean'].forEach(function(type) {
			me['get' + type[0].toUpperCase() + type.substr(1)] = function(name, fallback) {
				return ED.util.JS.getValue(me.config, name, type, fallback);
			}
		});
		
		ED.Log.d('EpicDoc config ready');
		callback();
	}
	
});
