
Ext.define('ED.view.FormWindow', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.window.Window',
    alias: 'widget.edformwindow',
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    isValid: function() {
        return !!this.isRecursiveValid(this);
    },
    
    getField: function(itemId) {
        return Ext.isString(itemId) ? this.down('#' + itemId) : null;
    },
    
    getValue: function(itemId) {
        var field = this.getField(itemId);
        
        if (field && Ext.isFunction(field.getValue)) {
            return field.getValue();
        }
    },
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    isRecursiveValid: function(cmp) {
        var me = this,
            valid = true;
            
        if (cmp && Ext.isFunction(cmp.validate)) {
            valid &= cmp.validate();
        }
        
        if (cmp.items && Ext.isFunction(cmp.items.each)) {
            cmp.items.each(function(child) {
                valid &= me.isRecursiveValid(child);
            });
        }
        
        return valid;
    },
    
    constructor: function(cfg) {
        var me = this;
        
        me.callParent([Ext.applyIf(cfg || {}, {
            modal: true,
            resizable: false,
            closeAction: 'destroy',
            buttonAlign: 'center',
            layout: {
                type: 'vbox',
                align: 'stretch',
                padding: 10
            },
            defaults: {
                width: 300,
                labelWidth: 75
            },
            buttons: [{
                text: ED.lang.ok,
                handler: Ext.bind(me.trySafe, me)
            }, {
                text: ED.lang.cancel,
                handler: Ext.bind(me.close, me)
            }]
        })]);
        
        me.addEvents('save');
        
        me.on('show', function() {
            Ext.callback('focus', me.getField(me.focusField), [true], 100);
        });
        
        me.on('afterrender', function(){
            me.keyNav = Ext.create('Ext.util.KeyNav', me.el, {                    
                enter: Ext.bind(me.trySafe, me)
            });
        });
    },
    
    trySafe: function() {
        var me = this;
        
        if (me.isValid()) {
            if (me.fireEvent('save') !== false && (Ext.isFunction(me.save) ? me.save() !== false : 1)) {
                me.close();
            }
        }
    }
});
