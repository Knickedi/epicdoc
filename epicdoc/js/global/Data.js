
Ext.define('ED.Data', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.util.Observable',
	singleton: true,

	// PUBLIC GETTER ---------------------------------------------------------------------------------
	
	generateDataId: function() {
        return new Date().getTime().toString(16)
			+ Math.round(Math.random() * Math.pow(2, 32)).toString(16);
	},
	
	getAllDataIds: function() {
		return Ext.Object.getKeys(this.dataMap);
	},
	
	getDataParentId: function(id) {
		return this.getDataProperty(id, 'parentId', 'string');
	},
	
	getDataChildIds: function(parentId) {
		var ids = [],
			map = this.dataMap;
		
		for (var id in map) {
			if (map[id] && map[id].parentId == parentId) {
				ids.push(id);
			}
		}
		
		return this.sortDataIds(ids);
	},
	
	getSectionDataIds: function() {
		var me = this,
			ids = [];
		
		for (var id in me.dataMap) {
			if (me.dataMap[id].type == 'section') {
				ids.push(id);
			}
		}
		
		return me.sortDataIds(ids);
	},
	
	getDataTextProperty: function(id, property) {
		var data = this.getDataProperty(id, property);
		
		if (Ext.isString(data)) {
			return data;
		}
		
		var s = '',
			first = true;
			
		if (Ext.isArray(data)) {
			data.forEach(function(line) {
				if (Ext.isString(line)) {
					if (!first) {
						s += '\n';
					}
					
					first = false;
					s += line;
				}
			});
		}
		
		return s;
	},
	
	getDataType: function(id) {
		return this.getDataProperty(id, 'type');
	},
	
	getDataProperty: function(id, property, type, fallback) {
		if (Ext.isString(id) && Ext.isString(property)) {
			return ED.util.JS.getValue(this.dataMap[id], property, type, fallback);
		} else {
			return fallback;
		}
	},
	
	sortDataIds: function(ids) {
		var me = this,
			order = me.dataOrder,
			lengthBefore = order.length;
		
		ids.sort(function(id1, id2) {
			var idx1 = order.indexOf(id1),
				idx2 = order.indexOf(id2);
				
			if (idx1 < 0 && idx2 < 0) {
				order.push(id1, id2);
				return -1;
			} else if (idx1 < 0) {
				order.push(id1);
				return 1;
			} else if (idx2 < 0) {
				order.push(id2);
				return -1;
			} else {
				return idx1 - idx2 < 0 ? -1 : 1;
			}
		});
		
		if (lengthBefore != order.length && ED.App.isEditable()) {
			me.replaceRef('dataorder', order);
			me.onDataChange();
		}
		
		return ids;
	},
	
	getRawData: function() {
		return this.rawData;
	},
	
	// PUBLIC SETTER ---------------------------------------------------------------------------------
	
	removeDataId: function(id, isRecursive) {
		var me = this;
		
		if (Ext.isString(id)) {
			var data = me.dataMap[id];
			delete me.dataMap[id];
			
			if (data) {
				me.getDataChildIds(id).forEach(function(id) {
					me.removeDataId(id, true);
				});
				
				me.removeFromRef('data', data);
				me.fireEvent('dataremove', id, data, !!isRecursive);
				
				if (!isRecursive) {
					me.cleanupDataOrderEntries();
					me.onDataChange();
				}
			}
		}
	},
	
	insertData: function(data) {
		var me = this;
		
		if (Ext.isObject(data) && Ext.isString(data.id) && !me.dataMap[data.id]) {
			data.created = new Date();
			me.dataMap[data.id] = data;
			me.pushToRef('data', data);
			me.fireEvent('datainsert', data.id, data);
			me.onDataChange();
		}
	},
	
	setDataParentId: function(id, parentId) {
		if (Ext.isString(id) && Ext.isString(parentId)) {
			var map = this.dataMap,
				data = map[id],
				parentData = map[parentId];
			
			if (data && parentData && data.parentId != parentId) {
				this.fireEvent('dataparentchange', id, data.parentId, data.parentId = parentId);
				this.onDataChange();
			}
		}
	},
	
	updateDataId: function(oldId, newId) {
		if (Ext.isString(oldId) && Ext.isString(newId)) {
			var me = this,
				data = me.dataMap[oldId];
			
			if (data) {
				delete me.dataMap[oldId];
				me.dataMap[newId] = data;
				data.id = newId;
				me.fireEvent('dataidchange', oldId, newId, data);
				me.onDataChange();
			}
		}
	},
	
	setDataTextProperty: function(id, property, value) {
		if (Ext.isString(property)) {
			if (Ext.isString(value)) {
				value = value.split(/\n/);
			} else if (Ext.isArray(value)) {
				var array = [];

				value.forEach(function(line) {
					if (Ext.isString(line)) {
						value.push(line);
					}
				});

				value = array;
			}

			if (Ext.isArray(value)) {
				this.setDataProperty(id, property + 'modified', new Date());
				this.setDataProperty(id, property, value);
			}
		}
	},
	
	setDataProperty: function(id, property, value) {
		if (Ext.isString(id) && Ext.isString(property)) {
			var data = this.dataMap[id];
			
			if (data && data[property] != value) {
				var oldValue = data[property];
				data[property] = value;
				this.fireEvent('datapropertychange', id, property, value, oldValue, data);
				this.onDataChange();
			}
		}
	},
	
	setDataOrder: function(id, position, refId) {
		if (Ext.isString(id) && id != refId) {
			var me = this,
				data = me.dataMap[id];
				newOrder = [],
				order = me.dataOrder;
			
			if (!data) {
				return;
			} else if (position == 'append') {
				var ids = me.getDataChildIds(refId);
				
				if (ids.length <= 1) {
					return;
				} else {
					refId = ids[ids.length - 1];
					position = 'after';
					
					if (ref == id) {
						return;
					}
				}
			}
			
			if (position == 'before' || position == 'after') {
				var found = false;
				
				order.forEach(function(dataId) {
					if (dataId == refId) {
						if (position == 'before') {
							newOrder.push(id, dataId);
						} else if (position == 'after') {
							newOrder.push(dataId, id);
						}
						
						found = true;
					} else if (dataId != id) {
						newOrder.push(dataId);
					}
				});
				
				if (!found) {
					newOrder.push(id);
				}
			} else {
				return;
			}
			
			me.dataOrder = newOrder;
			
			if (ED.App.isEditable()) {
				me.replaceRef('dataorder', newOrder);
				me.onDataChange();
			}
		}
	},
	
	// PRIVATE ---------------------------------------------------------------------------------------
	
	onDataChange: function() {
		this.fireEvent('datachange');
	},
	
	getRef: function(type) {
		var me = this,
			ref = me[type + 'Ref'];
		
		if (!ref) {
			me.rawData.push(ref = me[type + 'Ref'] = [type, []]);
		}
		
		return ref;
	},
	
	pushToRef: function(type, data) {
		this.getRef(type)[1].push(data);
	},
	
	removeFromRef: function(type, data) {
		var ref = this.getRef(type),
			index = ref[1].indexOf(data);
		
		if (index != -1) {
			ref[1] = ref[1].slice(0, index).concat(ref[1].slice(index + 1));
		}
	},
	
	replaceRef: function(type, data) {
		this.getRef(type)[1] = data;
	},
	
	cleanupDataOrderEntries: function() {
		var me = this,
			order = me.dataOrder,
			newOrder = [];
		
		order.forEach(function(id) {
			if (Ext.isString(id) && me.dataMap[id] && newOrder.index(id) == -1) {
				newOrder.push(id);
			}
		});
		
		if (order.length != newOrder) {
			me.replaceRef('dataorder', me.dataOrder = newOrder);
			me.onDataChange();
		}
	},

	// INITIALIZATION --------------------------------------------------------------------------------
	
	constructor: function() {
		var me = this;
		
        me.callParent();
		me.addEvents(
			'datainsert',
			'dataremove',
			'datachange',
			'dataidchange',
			'datapropertychange'
		);
	},
	
	init: function(callback) {
		var me = this;
		
		me.dataMap = {};
		me.dataOrder = [];
		me.dataRef;
		me.rawData = ED.util.JS.getValue(window, 'epicdata', 'array');
		
		var finalize = Ext.bind(me.initFinalize, me, [callback]);
		
		ED.Storage.init(function(data) {
			me.rawData = data || me.rawData;
			
			if (!Ext.isDefined(me.rawData)) {
				ED.util.ResourceLoader.loadScripts({
					paths: 'http://knickedi.github.io/epicdoc/data',
					finish: function() {
						me.rawData = ED.util.JS.getValue(window, 'epicdata', 'array', []);
						finalize();
					}
				});
			} else {
				finalize();
			}
		});
	},
	
	initFinalize: function(callback) {
		var me = this;
		
		me.rawData.forEach(function(el) {
			if (!Ext.isArray(el) || el.length != 2) {
				return;
			}
			
			var type = el[0];
			
			if (type == 'data') {
				Ext.Array.from(el[1]).forEach(function(entry) {
					if (Ext.isObject(entry) && Ext.isString(entry.id)) {
						me.dataMap[entry.id] = entry;
					}
				});
				
				if (!me.dataRef) {
					me.dataRef = el;
				}
			} if (type == 'dataorder') {
				Ext.Array.from(el[1]).forEach(function(entry) {
					if (Ext.isString(entry)) {
						me.dataOrder.push(entry);
					}
				});
				
				if (!me.dataorderRef) {
					me.dataorderRef = el;
				}
			}
		});
		
		ED.Log.d('EpicDoc data ready');
		callback();
	}
});
