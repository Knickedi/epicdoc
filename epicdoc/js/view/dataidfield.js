
Ext.define('ED.view.DataIdField', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.form.TextField',
    alias: 'widget.eddataidfield',
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        cfg = cfg || {};
        cfg.dataId = Ext.isString(cfg.dataId) ? cfg.dataId : null;
        
        this.callParent([Ext.apply(cfg, {
            allowBlank: false,
            value: cfg.dataId || ED.Data.generateDataId(),
            dataId: cfg.dataId
        })]);
    },
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    validate: function() {
        var me = this,
            id = me.getValue().toLowerCase();
        
        if (!me.callParent()) {
            return false;
        }
        
        if (me.dataId && me.dataId.toLowerCase() == id) {
            return true;
        }
        
        if (new RegExp(/[^0-9a-zA-Z-_]/).test(id)) {
            me.markInvalid(ED.lang.errorIdInvalidChar);
            return false;
        }
        
        var ids = ED.Data.getAllDataIds().map(function(id) { return id.toLowerCase(); });
        
        if (Ext.Array.contains(ids, id)) {
            me.markInvalid(ED.lang.errorIdNotUnique);
            return false;
        }
        
        return true;
    }
})