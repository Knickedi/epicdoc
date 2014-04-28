
Ext.define('ED.view.CodePanel', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.container.Container',
    alias: 'widget.edcodepanel',
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        var me = this,
            data = ED.Data,
            editable = ED.App.isEditable(),
            items = [],
            toolbarItems = [],
            content = data.getDataTextProperty(id, 'content')
            
        items.push({
            xtype: 'toolbar',
            cls: 'ed-code-toolbar',
            items: toolbarItems
        });
        
        if (editable) {
            toolbarItems.push('->', {
                xtype: 'button',
                iconCls: 'ed-icon-add',
                tooltip: ED.lang.addGroup,
                handler: function() {
                    Ext.widget('window', {
                        closeAction: 'destroy',
                        title: ED.lang.addGroup,
                        modal: true,
                        layout: {
                            type: 'vbox',
                            align: 'stretch',
                            padding: 10
                        },
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: ED.lang.title,
                            width: 300,
                            itemId: 'title',
                            allowBlank: false
                        }],
                        buttons: [{
                            text: ED.lang.ok,
                            handler: function() {
                                
                            }
                        }, {
                            text: ED.lang.cancel,
                            handler: function() {
                                this.up('window').close();
                            }
                        }]
                    }).show();
                }
            });
        }
            
        if (editable || content) {
            items.push({
                xtype: 'edepiceditor',
                content: content,
                margin: '10 0 10 0',
                callback: function(content) {
                    data.setDataTextProperty(id, 'content', content);
                }
            });
        }
        
        me.callParent([Ext.apply(cfg, {
            items: items
        })]);
    }
});
