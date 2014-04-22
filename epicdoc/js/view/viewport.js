
Ext.define('Ed.view.Viewport', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.container.Viewport',
	alias: 'widget.edviewport',
	
	// INITILIZATION ---------------------------------------------------------------------------------
	
	constructor: function() {
		var me = this;
		
		/*
		 ----------------------------------------------
		| title | subtitle | < toolbar > | searchfield |
		 ----------------------------------------------
		|  /\  |          |            /\              |
		| menu | splitter |        < content >         |
		|  \/  |          |            \/              |
		 ----------------------------------------------
		*/
		
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
						hidden: true,
						tooltip: ED.lang.add,
						handler: function() {
							Ext.widget('edsectionwindow', {
								animateTarget: this.el
							}).show();
						}
					}, {
						xtype: 'button',
						edLiveUpdater: true,
						iconCls: 'ed-icon-server',
						tooltip: ED.lang.checkForLiveUpdater,
						hidden: true,
						handler: function() {
							ED.func.LiveUpdater.testForLocalServer();
						}
					}]
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
					itemId: 'menu',
					width: 300,
					minWidth: 200,
					header: false,
					collapseDirection: 'left',
					border: false,
					layout: 'accordion'
				}, {
					xtype: 'splitter',
					collapsible: true,
					collapseTarget: 'prev',
					cls: 'ed-splitter',
					width: 8
				}, {
					id: 'content',
					minWidth: 600,
					border: false,
					flex: 1,
					maintainFlex: true,
					layout: 'fit'
				}],
			}],

			listeners: {
				render: function() {
					me.setupViewUpdatesByEvents();
					me.updateMenu();
					
					// disallow right click on application, just for consistency
					// we will allow contextmenu on certain elements and don't want
					// to popup the browser contextmenu, if the clicked elements
					// doesn't provide one
					me.el.on('contextmenu', function(e) {
						e.stopEvent();
						return false;
					});
				}
			},
		}]);
	},
	
	setupViewUpdatesByEvents: function() {
		var me = this,
			data = ED.Data,
			menu = me.down('#menu');
			menuDataIdComponents = function() {
				return menu.query('[dataId]');
			};
		
		me.mon(data, 'datainsert', function(id, data) {
			if (data.type == 'section') {
				menu.add(me.createSectionItem(id));
			}
		});
		
		me.mon(data, 'dataremove', function(id, data) {
			menuDataIdComponents().forEach(function(cmp) {
				if (cmp.dataId == id) {
					cmp.ownerCt.remove(cmp);
				}
			});
		});
		
		me.mon(data, 'dataidchange', function(oldId, newId) {
			menuDataIdComponents().forEach(function(cmp) {
				if (cmp.dataId == oldId) {
					cmp.dataId = newId;
				}
			});
		});
		
		me.mon(data, 'datapropertychange', function(id, property, value, old, data) {
			if (property == 'title') {
				menuDataIdComponents().forEach(function(cmp) {
					if (cmp.dataId == id) {
						Ext.callback('setTitle', cmp, [value]);
					}
				});
			}
		});
	},
	
	updateMenu: function() {
		var me = this,
			menu = me.down('#menu'),
			data = ED.Data;
		
		menu.removeAll();
		
		Ext.each(data.getSectionDataIds(), function(id) {
			menu.add(me.createSectionItem(id));
		});
	},
	
	createSectionItem: function(id) {
		var me = this,
			data = ED.Data;
			
		return {
			xtype: 'treepanel',
			dataId: id,
			title: data.getDataProperty(id, 'title'),
			rootVisible: false,
			root: {
				children: me.createTreeNodeChildren(id)
			},
			listeners: {
				render: function(tree) {
					Ext.get(tree.el.query('.x-panel-header')[0]).on('contextmenu', function(e) {
						if (ED.App.isEditable()) {
							me.createTreePanelHeaderContextMenu(tree, this.el, e);

							e.stopEvent();
							return false;
						}
					});
				},
				itemcontextmenu: function(tree, record, item, index, e) {
					if (ED.App.isEditable()) {
						me.createNodeContextMenu(tree, record, e);

						e.stopEvent();
						return false;
					}
				},
				itemclick: function(tree, record, item, index, e) {
					me.nodeClick(tree, record, e);
				}
			}
		}
	},
	
	createTreeNodeChildren: function(parentId) {
		var me = this,
			data = ED.Data,
			children = [];
		
		data.getDataChildrenIds(parentId).forEach(function(id) {
			var node = {
				dataId: id,
				dataParentId: parentId,
				text: data.getDataProperty(id, 'title')
			};
			var type = data.getDataProperty(id, 'type');
			
			if (type == 'text') {
				node.leaf = true;
				node.iconCls = 'ed-icon-document';
			}
			
			if (type == 'folder') {
				node.children = me.createTreeNodeChildren(id);
				node.iconCls = 'ed-icon-folder';
			}
			
			children.push(node);
		});
		
		return children;
	},
	
	createTreePanelHeaderContextMenu: function(tree, headerEl, e) {
		var data = ED.Data,
			sectionsIds = data.getSectionDataIds(),
			items = [];

		items.push({
			text: ED.lang.add,
			iconCls: 'ed-icon-add',
			handler: function() {
				Ext.widget('edcontentwindow', {
					animateTarget: headerEl,
					dataId: tree.dataId
				}).show();
			},
		}, {
			text: ED.lang.edit,
			iconCls: 'ed-icon-edit',
			handler: function() {
				Ext.widget('edsectionwindow', {
					animateTarget: headerEl,
					dataId: tree.dataId,
					dataTitle: data.getDataProperty(tree.dataId, 'title')
				}).show();
			}

		}, {
			text: ED.lang.delete,
			iconCls: 'ed-icon-delete',
			handler: function() {
				Ext.Msg.confirm({
					animateTarget: headerEl,
					title: ED.lang.delete + '?',
					icon: Ext.Msg.QUESTION,
					msg: ED.lang.deleteConfirm,
					buttons: Ext.Msg.YESNO,
					callback: function(btn) {
						if (btn == 'yes') {
							data.removeDataId(tree.dataId);
						}
					}
				});
			},
		});

		Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
	},
	
	createNodeContextMenu: function(tree, record, e) {
		var items = [];
		
		items.push({
			text: 'boing'
		});
		
		Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
	},
	
	nodeClick: function(tree, record, e) {
		var me = this,
			id = record.raw.dataId,
			content = me.down('#content'),
			data = ED.Data,
			type = data.getDataProperty(id, 'type');
		
		if (type == 'text') {
			content.removeAll();
			content.dataId = id;
			content.add({
				xtype: 'edepiceditor',
				dataId: id,
				margin: 10,
				content: data.getDataTextProperty(id, 'content'),
				callback: function(content) {
					data.setDataTextProperty(id, 'content', content);
				}
			});
		}
	},
});
