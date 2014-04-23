
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
						line += '\n';
					}
					
					first = false;
					s += line;
				}
			});
		}
		
		return s;
	},
	
	getDataProperty: function(id, property, type, fallback) {
		if (Ext.isString(id) && Ext.isString(property)) {
			return ED.util.JS.getValue(this.dataMap[id], property, type, fallback);
		} else {
			return fallback;
		}
	},
	
	sortDataIds: function(ids) {
		
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
			this.setDataProperty(id, property, value);
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
		me.dataRef;
		me.rawData = ED.util.JS.getValue(window, 'epicdata', 'array', []);
		
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
				
			}
		});
		
		ED.Log.d('EpicDoc data ready');
		callback();
	}
	
});
