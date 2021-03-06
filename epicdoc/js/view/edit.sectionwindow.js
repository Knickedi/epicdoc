
Ext.define('ED.view.EditSectionWindow', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.window.Window',
    alias: 'widget.ededitsectionwindow',
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        var me = this;
		
		if (!Ext.isString(cfg.dataId)) {
			throw 'No data ID specified';
		}
        
        me.callParent([Ext.apply(cfg || {}, {
            modal: true,
            title: ED.lang.section,
            closeAction: 'destroy',
            layout: {
                type: 'vbox',
                align: 'stretch',
                padding: 10
            },
            defaults: {
                width: 300,
                labelWidth: 75
            },
            items: [{
                xtype: 'textfield',
                allowBlank: false,
                itemId: 'title',
                fieldLabel: ED.lang.title,
                value: ED.Data.getDataProperty(cfg.dataId, 'title')
            }],
            buttons: [{
                text: ED.lang.ok,
                handler: Ext.bind(me.save, me)
            }, {
                text: ED.lang.cancel,
                handler: Ext.bind(me.close, me)
            }],
            listeners: {
                show: function() {
                    Ext.callback('focus', this.down('#title'), [true], 100);
                },
                afterRender: function(thisForm, options){
                    var me = this;
                    
                    me.keyNav = Ext.create('Ext.util.KeyNav', me.el, {                    
                        enter: me.save,
                        scope: me
                    });
                }
            },
        })]);
    },
    
    save: function() {
        var me = this;
            titleCmp = me.down('#title'),
            title = titleCmp.getValue(),
            data = ED.Data;
        
        if (titleCmp.validate()) {
			data.setDataProperty(me.dataId, 'title', title);
            me.close();
        }
    }
    
});
