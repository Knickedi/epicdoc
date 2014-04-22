
Ext.define('ED.view.SectionWindow', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.window.Window',
    alias: 'widget.edsectionwindow',
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        var me = this;
        
        me.callParent([Ext.apply(cfg || {}, {
            modal: true,
            title: ED.lang.section,
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
                value: cfg.dataTitle
            /*}, {
                xtype: 'eddataidfield',
                itemId: 'id',
                dataId: cfg.dataId,
                fieldLabel: ED.lang.id*/
            }],
            buttons: [{
                text: ED.lang.ok,
                handler: Ext.bind(me.save, me)
            }, {
                text: ED.lang.cancel,
                handler: Ext.bind(me.close, me)
            }],
            listeners: {
                hide: Ext.bind(me.destroy, me),
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
            //idCmp = me.down('#id'),
            //id = idCmp.getValue(),
            title = titleCmp.getValue(),
            data = ED.Data;
        
        if (titleCmp.validate()/* && idCmp.validate()*/) {
            if (Ext.isString(me.dataId)) {
                //data.updateDataId(me.dataId, id);
                data.setDataProperty(me.dataId, 'title', title);
            } else {
                data.insertData({
                    id: data.generateDataId(),
                    type: 'section',
                    title: title
                });
            }
            
            me.close();
        }
    }
    
});
