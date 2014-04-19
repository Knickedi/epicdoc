
Ext.define('Ed.view.Viewport', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.container.Viewport',
	alias: 'widget.edviewport',
	
	// INITILIZATION ---------------------------------------------------------------------------------
	
	constructor: function() {
		var me = this;
		
		me.callParent([{
			layout: {
				type: 'vbox',
				align: 'stretch',
			},
			items: [{
				layout: {
					type: 'hbox',
					align: 'middle',
					padding: 10
				},
				cls: 'ed-header',
				items: [{
					xtype: 'displayfield',
					cls: 'ed-header-title',
					value: ED.App.getTitle(),
				}, {
					xtype: 'displayfield',
					cls: 'ed-header-subtitle',
					margin: '0 0 0 5',
					value: ED.App.getSubTitle()
				}, {
					xtype: 'toolbar',
					border: false,
					flex: 1,
					cls: 'ed-header-toolbar',
					layout: {
						type: 'hbox', 
						align: 'middle'
					},
					items: [{
						xtype: 'button',
						edEditable: true,
						iconCls: 'ed-icon-add',
						cls: 'x-toolbar-btn',
						hidden: true,
						tooltip: ED.lang.addNewSection,
						listeners: {
							click: function() {
								Ext.widget('edsectionwindow', {
									animateTarget: this.el
								}).show();
							}
						}
					}],
					listeners: {
						render: function() {
							var items = [];
							//this.up('viewport').app.fireEvent('toolbar', items);
							//this.add(items);
						}
					}
				}, {
					xtype: 'textfield',
					itemId: 'searchfield',
					width: 300,
					emptyText: ED.lang.search
				}]

			}, {
				layout: {
					type: 'hbox',
					align: 'stretch'
				},
				bodyCls: 'ed-theme-border',
				flex: 1,
				items: [{
					itemId: 'leftpanel',
					width: 300,
					minWidth: 200,
					header: false,
					collapseDirection: 'left',
					border: false,
					layout: 'fit'
				}, {
					xtype: 'splitter',
					collapsible: true,
					collapseTarget: 'prev',
					cls: 'ed-splitter',
					width: 8
				}, {
					id: 'rightpanel',
					minWidth: 600,
					border: false,
					flex: 1,
					maintainFlex: true,
					layout: 'fit'
				}],
			}],

			listeners: {
				render: function() {
					me.updateMenu();
					me.el.on('contextmenu', function(e) {
						e.stopEvent();
						return false;
					});
				}
			},
		}]);
		
		var data = ED.Data,
			leftpanel = function() {
				return me.down('#leftpanel');
			},
			accordion = function() {
				return me.down('#accordion');
			},
			leftpanelDataQuery = function() {
				return leftpanel().query('[dataId]');
			};
		
		me.mon(data, 'datainsert', function(id, data) {
			if (data.type == 'section') {
				accordion().add(me.createSectionItem(id));
			}
		});
		
		me.mon(data, 'dataremove', function(id, data) {
			leftpanelDataQuery().forEach(function(cmp) {
				if (cmp.dataId == id) {
					cmp.ownerCt.remove(cmp);
				}
			});
		});
		
		me.mon(data, 'dataidchange', function(oldId, newId) {
			leftpanelDataQuery().forEach(function(cmp) {
				if (cmp.dataId == oldId) {
					cmp.dataId = newId;
				}
			});
		});
		
		me.mon(data, 'datapropertychange', function(id, property, value, old, data) {
			if (property == 'title') {
				leftpanelDataQuery().forEach(function(cmp) {
					if (cmp.dataId == id) {
						Ext.callback('setTitle', cmp, [value]);
					}
				});
			}
		});
	},
	
	updateMenu: function() {
		var me = this,
			leftPanel = me.down('#leftpanel'),
			data = ED.Data;
		
		var accordionItems = [];
		
		Ext.each(data.getSectionDataIds(), function(id) {
			accordionItems.push(me.createSectionItem(id));
		});
		
		leftPanel.removeAll();
		leftPanel.add({
			border: false,
			itemId: 'accordion',
			layout: 'accordion',
			items: accordionItems
		});
	},
	
	createSectionItem: function(id) {
		var data = ED.Data;
			
		return {
			dataId: id,
			title: data.getDataProperty(id, 'title'),
			listeners: {
				render: function() {
					var me = this;
					
					Ext.get(me.el.query('.x-header')[0]).on('contextmenu', function(e) {
						var sectionsIds = data.getSectionDataIds(),
							items = [];
						
						items.push({
							text: ED.lang.edit,
							iconCls: 'ed-icon-edit',
							handler: function() {
								Ext.widget('edsectionwindow', {
									animateTarget: this.el,
									dataId: me.dataId,
									dataTitle: data.getDataProperty(me.dataId, 'title')
								}).show();
							}
						}, {
							text: ED.lang.delete,
							iconCls: 'ed-icon-delete',
							handler: function() {
								Ext.Msg.confirm(
									ED.lang.delete + '?',
									ED.lang.deleteConfirm,
									function(btn) {
										if (btn == 'yes') {
											data.removeDataId(me.dataId);
										}
									}
								);
							},
						});
						
						e.stopEvent();
						Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
						return false;
					});
				}
			}
		}
	},
});
