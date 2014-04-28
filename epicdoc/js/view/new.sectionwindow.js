
Ext.define('ED.view.NewSectionWindow', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'ED.view.FormWindow',
    alias: 'widget.ednewsectionwindow',
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        var me = this;
        
        me.callParent([Ext.apply(cfg || {}, {
            title: ED.lang.section,
            focusField: 'title',
            items: [{
                xtype: 'textfield',
                allowBlank: false,
                itemId: 'title',
                fieldLabel: ED.lang.title,
                value: cfg.dataTitle
            }],
            save: function() {
                var data = ED.Data;

                data.insertData({
                    id: data.generateDataId(),
                    type: 'section',
                    title: me.getValue('title')
                });
            },
        })]);
    }
});
