
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
							Ext.widget('ednewsectionwindow', {
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
					}, '->', {
						xtype: 'displayfield',
						value: ED.lang.license,
						cls: 'ed-header-license',
						listeners: {
							render: function() {
								this.el.on('click', function() {
									Ext.widget('edlicensewindow', {
										animateTarget: this.el
									}).show();
								});
							}
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
					overflowY: 'auto',
					bodyPadding: 10,
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
	
	setEditable: function(editable) {
		this.query('[edEditable]').forEach(function(cmp) {
			Ext.callback('setVisible', cmp, [editable]);
		});
		
		this.query('treepanel').forEach(function(tree) {
			Ext.Array.findBy(tree.view.plugins, function(p) {
				return p.ptype == 'treeviewdragdrop';
			}).dragZone[editable ? 'unlock' : 'lock']();
		});
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
			} else {
				var node,
					parentId = data.parentId;
				
				menu.items.each(function(tree) {
					if (!node) {
						node = parentId == tree.dataId ? tree.getRootNode() : tree.getStore().getNodeById(parentId);
					}
				});
					
				if (node) {
					node.appendChild(me.createTreeNode(id));
				}
			}
		});
		
		me.mon(data, 'dataremove', function(id, data, recursion) {
			if (recursion) {
				return;
			}
			
			menu.items.each(function(tree) {
				var node = tree.getStore().getNodeById(id);
				
				if (node) {
					node.parentNode.removeChild(node);
				}
			});
			
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
			
		// tree view is inserting a horizontal scrollbar if the root node has no children
		// there's a div under a the table which has "left:9999px" causing that (why?)
		// we find that div and set left to 0px
		// we have to defer it otherwise the div won't be there yet on first render...
		var fixEmptyTree = function(tree) {
			Ext.defer(function() {
				if (tree.getRootNode().childNodes.length == 0) {
					tree.el.select('div:prev(table)').applyStyles({ left: '0px' });
				}
			}, 1);
		};
			
		return {
			xtype: 'treepanel',
			useArrows: true,
			dataId: id,
			title: data.getDataProperty(id, 'title'),
			rootVisible: false,
			root: {
				expanded: true,
				children: me.createTreeNodeChildren(id)
			},
			viewConfig: {
				plugins: {
					ptype: 'treeviewdragdrop',
					ddGroup: 'treednd'
				},
				listeners: {
					drop: function (node, srcData, overModel, position) {
						var dest = overModel.raw,
							data = ED.Data,
							append = position == 'append',
							id = srcData.records[0].raw.dataId,
							parentId = append ? dest.dataId : dest.dataParentId;
						
						data.setDataParentId(id, parentId);
						data.setDataOrder(id, position, append ? null : dest.dataId);
					},
					viewready: function() {
						fixEmptyTree(this.ownerCt);
					}
				}
			},
			listeners: {
				render: function(tree) {
					// we disable DND for now until the app becomes editable
					Ext.defer(function() {
						Ext.Array.findBy(tree.view.plugins, function(p) {
							return p.ptype == 'treeviewdragdrop';
						}).dragZone.lock();
					}, 1);
					
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
						me.createNodeContextMenu(tree, record, item, e);

						e.stopEvent();
						return false;
					}
				},
				itemclick: function(tree, record, item, index, e) {
					me.nodeClick(tree, record, e);
				},
				expand: function() {
					var id = me.down('#content').dataId;
					
					if (id) {
						this.getSelectionModel().select(this.getStore().getNodeById(id));
					}
				},
				collapse: function() {
					this.getSelectionModel().deselectAll();
				},
				itemremove: function() {
					fixEmptyTree(this);
				}
			}
		};
	},
	
	createTreeNode: function(id) {
		var me = this,
			data = ED.Data,
			type = data.getDataType(id);
			
		var node = {
			id: id,
			dataId: id,
			dataType: type,
			dataParentId: data.getDataParentId(id),
			text: data.getDataProperty(id, 'title')
		};

		if (type == 'text') {
			node.leaf = true;
			node.iconCls = 'ed-icon-document';
		} else if (type == 'code') {
			node.leaf = true;
			node.iconCls = 'ed-icon-code';
		} else if (type == 'folder') {
			node.children = me.createTreeNodeChildren(id);
			node.iconCls = 'ed-icon-tree-folder';
			node.leaf = false;
			node.expanded = true;
		}
		
		return node;
	},
	
	createTreeNodeChildren: function(parentId) {
		var me = this,
			children = [];
		
		ED.Data.getDataChildIds(parentId).forEach(function(id) {
			children.push(me.createTreeNode(id));
		});
		
		return children;
	},
	
	createTreePanelHeaderContextMenu: function(tree, headerEl, e) {
		var me = this,
			data = ED.Data,
			id = tree.dataId,
			sectionsIds = data.getSectionDataIds(),
			items = [];

		items.push({
			text: ED.lang.add,
			iconCls: 'ed-icon-add',
			handler: function() {
				Ext.widget('ednewcontentwindow', {
					animateTarget: headerEl,
					dataId: id
				}).show();
			},
		}, {
			text: ED.lang.edit,
			iconCls: 'ed-icon-edit',
			handler: function() {
				Ext.widget('ededitsectionwindow', {
					animateTarget: headerEl,
					dataId: id
				}).show();
			}

		}, {
			text: ED.lang.delete,
			iconCls: 'ed-icon-delete',
			handler: me.deleteDataWithConfirmFn(id, headerEl),
		});

		Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
	},
	
	createNodeContextMenu: function(tree, record, item, e) {
		var me = this,
			items = [],
			id = record.raw.dataId;
			type = ED.Data.getDataType();
		
		items.push({
			text: ED.lang.edit,
			iconCls: 'ed-icon-edit',
			handler: function() {
				Ext.widget('ededit' + type + 'window', {
					animateTarget: item,
					dataId: id,
				}).show();
			}
		}, {
			text: ED.lang.delete,
			iconCls: 'ed-icon-delete',
			handler: me.deleteDataWithConfirmFn(id, item),
		});
		
		Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
	},
	
	nodeClick: function(tree, record, e) {
		var me = this,
			id = record.raw.dataId,
			content = me.down('#content'),
			data = ED.Data,
			type = data.getDataType(id);
		
		if (type == 'text') {
			content.removeAll();
			content.dataId = id;
			content.add({
				xtype: 'edepiceditor',
				dataId: id,
				content: data.getDataTextProperty(id, 'content'),
				callback: function(content) {
					data.setDataTextProperty(id, 'content', content);
				}
			});
		}
	},
	
	deleteDataWithConfirmFn: function(id, targetEl) {
		return function() {
			Ext.Msg.confirm({
				animateTarget: targetEl,
				title: ED.lang.delete + '?',
				icon: Ext.Msg.QUESTION,
				msg: ED.lang.deleteConfirm,
				buttons: Ext.Msg.YESNO,
				callback: function(btn) {
					if (btn == 'yes') {
						ED.Data.removeDataId(id);
					}
				}
			});
		};
	}
});
