
Ext.define('ED.view.StorageWindow', {

	// ATTRIBUTES ---------------------------------------------------------------------------------
	
	extend: 'Ext.window.Window',
	alias: 'widget.edstoragewindow',
	
	// PRIVATE ------------------------------------------------------------------------------------
	
	constructor: function(cfg) {
		var me = this,
			items = [];
		
		if (ED.Storage.hasData()) {
			items.push({
				xtype: 'container',
				layout: {
					type: 'hbox',
					align: 'middle'
				},
				items: [{
					xtype: 'text',
					text: ED.lang.pageReloadInfo,
					margin: '0 10 0 0'
				}, {
					xtype: 'button',
					text: ED.lang.clearStorage,
					handler: function() {
						ED.Storage.clear(function() {
							window.location.reload();
						});
					}
				}]
			});
		} else {
			items.push({
				xtype: 'text',
				text: ED.lang.noStorageDataInfo
			});
		}
		
		me.callParent([Ext.apply(cfg || {}, {
			modal: true,
			title: ED.lang.localStorage,
			resizable: false,
			bodyPadding: 10,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: items
		})]);
	},
});