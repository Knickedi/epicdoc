
Ext.define('ED.Storage', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------

    singleton: true,
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    checkOnline: function() {
        var me = this;
        
        Ext.defer(function() {
            ED.App.setEditable('storage', !!me.store);
        }, 1);
    },
    
    // PRIVATE ------------------------------------------------------------------------------------
    
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
                        callback(data && Ext.isArray(data.data) ? data.data : undefined);
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
