
Ext.define('ED.func.LiveUpdater', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
	
	singleton: true,
	extend: 'Ext.util.Observable',
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    testForLocalServer: function() {
        var me = this;
        
        if (!me.enabled) {
            return;
        }
        
        Ext.Ajax.request({
			url: me.url + '/test',
			success: function(response) {
				if (response && response.responseText == 'epicdoc-test') {
					ED.Log.d('EpicDoc server test successful');
					me.setOnline(true);
				} else {
					ED.Log.e('EpicDoc server test sent but received an invalid response');
					me.setOnline(false);
				}
			},
			failure: function() {
				ED.Log.i('Failed to send test request to EpicDoc server');
				me.setOnline(false);
			}
		});
    },
	
	updateDataByServer: function() {
		var me = this;
		
		if (!me.enabled && me.online) {
			return;
		}
		
		clearTimeout(me.timerId);
		
		Ext.Ajax.request({
			url: me.url + '/data',
			method: 'POST',          
			params: {
				data: Ext.encode(ED.Data.getRawData()),
				datapath: me.localPath
			},
			success: function(response) {
				if (response && response.responseText == 'EpicDoc-Data') {
					me.setOnline(true);
				} else {
					ED.Log.i('Sent update request to EpicDoc server, but received an unexpected answer');
					me.setOnline(false);
				}
			},
			failure: function() {
				ED.Log.e('Did\'t find a EpicDoc server for update');
				me.setOnline(false);
			}
		});
	},
	
	// PRIVATE ---------------------------------------------------------------------------------------
	
	setOnline: function(online) {
		var me = this;
		
		if (me.online !== online) {
			me.online = online;
			me.fireEvent('online', online);
			ED.App.setEditable('liveupdater', online);
		}
	},
	
	// INITIALIZATION --------------------------------------------------------------------------------
	
	constructor: function() {
		var me = this;
		
		me.callParent();
		me.addEvents(
			'online'
		);
	},
	
	init: function() {
        var me = this,
            config = ED.Config;
        
        me.enabled = !config.getBoolean('server.disabled');
        
		if (me.enabled) {
			var url = window.location.toString();
			me.localPath = url.substr(0, 8) == 'file:///' ? decodeURIComponent(url.substring(8, url.lastIndexOf('/'))) : '';
			me.url = config.getString('server.url', 'http://localhost:54321');
			ED.Log.i('EpicDoc server enabled with url:', me.url);
			
			// remove back-/slashes at the end of the url
			me.url = me.url.replace(/[\/|\\\\]*$/, '');
			
			var delay = Math.max(500, Math.round(config.getNumber('server.delay', 1000)));
			
			ED.Data.on('datachange', function() {
				clearTimeout(me.timerId);
				me.timerId = Ext.defer(function() {
					me.updateDataByServer();
				}, delay);
			});
			
        	me.testForLocalServer();
		} else {
			ED.Log.i('EpicDoc server disabled');
		}
    },
});
