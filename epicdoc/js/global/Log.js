
Ext.define('ED.Log', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.util.Observable',
	singleton: true,

	// INITIALIZATION --------------------------------------------------------------------------------

	constructor: function() {
        var me = this;
        
        me.callParent();
        me.addEvents('log');
        
		Ext.each(['d', 'i', 'w', 'e'], function(type) {
            me[type] = function() {
                if (console) {
                    var fn = {
                        i: console.info,
                        w: console.warn,
                        e: console.error
                    }[type] || console.log;
                    
                    var date = new Date();
                    
                    if ((ED.App.debug || type != 'd') && Ext.isFunction(fn)) {
                        var args = Ext.Array.from(arguments);
                        args.unshift(Ext.Date.format(date, '[H:i:s]'));
                        fn.apply(console, args);
                    }
                    
                    me.fireEvent('log', type, date, arguments);
                }
            };
        });
	},
});
