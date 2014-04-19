
Ext.define('ED.func.LiveUpdater', {
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    testForLocalServer: function() {
        var me = this;
        
        if (!me.enabled) {
            return;
        }
        
        Ext.Ajax.request({
			url: me.testUrl,
			success: function(response) {
				if (response && response.responseText == 'EpicDoc-Test') {
					ED.App.setEditable('liveupdater', true);
					ED.Log.d('LiveUpdater server test successful');
				} else {
					ED.App.setEditable('liveupdater', false);
					ED.Log.e('LiveUpdater server test sent but received an invalid response');
				}
			},
			failure: function() {
				ED.App.setEditable('liveupdater', false);
				ED.Log.i('LiveUpdater did\'t find a server');
			}
		});
    },
	
	updateDataByServer: function() {
		var me = this;
		
		if (!me.enabled) {
			return;
		}
		
		clearTimeout(me.timerId);
		
		Ext.Ajax.request({
			url: me.updateUrl,
			method: 'POST',          
			params: {
				data: Ext.encode(ED.Data.getRawData()),
				path: me.dataPath
			},
			success: function(response) {
				if (response && response.responseText == 'EpicDoc-Update') {
					// updated
				} else {
					ED.Log.i('LiveUpdater sent update request, but received an unexpected answer');
				}
			},
			failure: function() {
				ED.Log.e('LiveUpdater did\'t find a server for update');
			}
		});
	},
	
	// INITIALIZATION --------------------------------------------------------------------------------
	
	constructor: function() {
        var me = this,
            config = ED.Config;
        
        me.enabled = !!config.getObject('liveUpdater');
        
        if (!me.enabled) {
			ED.Log.i('LiveUpdate disabled');
		}
        
		if (me.enabled) {
			['testUrl', 'updateUrl', 'dataPath'].forEach(function(name) {
				var value = me[name] = config.getString('liveUpdater.' + name, '');
				
				if (value.length == 0) {
					me.enabled = false;
					ED.Log.w('LiveUpdater disabled, invalid liveUpdater. ' + name + ' config:', value);
				}
			});
		}
		
		if (me.enabled) {
			ED.Log.i('LiveUpdater enabled');
			
			var delay = Math.max(500, Math.round(config.getNumber('liveupdater', 2500)));
			
			ED.Data.on('datachange', function() {
				clearTimeout(me.timerId);
				me.timerId = Ext.defer(function() {
					me.updateDataByServer();
				}, delay);
			});
		}
		
        me.testForLocalServer();
    },
});
