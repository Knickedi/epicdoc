
Ext.define('ED.Storage', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------

    singleton: true,
	extend: 'Ext.util.Observable',
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    checkOnline: function() {
        var me = this;
        
        Ext.defer(function() {
            me.fireEvent('online', !!me.store);
            ED.App.setEditable('storage', !!me.store);
        }, 1);
    },
	
	hasData: function() {
		return !!this.hasDataFlag;
	},
	
	clear: function(callback) {
		var me = this;
		
		if (me.store) {
			me.store.remove('data', function() {
				Ext.callback(callback);
			});
		} else {
			Ext.callback(callback);
		}
	},
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function() {
        var me = this;
        
        me.callParent();
        me.addEvents('online');
    },
    
    init: function(callback) {
        var me = this;
        
        try {
            var config = {
                storeName: 'data',
                storePrefix: 'epicdoc-',
                dbVersion: 1,
                keyPath: 'id',
                autoIncrement: true,
                indexes: [],
                onStoreReady: function(){
                    me.store.get('data', function(data) {
						me.hasDataFlag = data && Ext.isArray(data.data);
						callback(me.hasDataFlag ? data.data : undefined);
                    });
                    
                    ED.Data.on('datachange', function() {
                        me.store.put({ id: 'data', data: ED.Data.getRawData() });
                    });
                },
                onError: function(e) {
                    ED.Log.e('Storage initialization failed: ', e);
                    me.store = null;
                }
            };
            
            me.store = new IDBStore(config);
        } catch (e) {
            ED.Log.e('Storage initialization failed: ', e);
            callback();
        }
    },
});
