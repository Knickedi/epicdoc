
Ext.define('ED.util.JS', {
    
    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    singleton: true,
    
    // PUBLIC -------------------------------------------------------------------------------------
    
    getValue: function(obj, property, type, fallback) {
        if (!Ext.isObject(obj) && obj != window || !Ext.isString(property)) {
            return fallback;
        }
        
        var parts = property.split(/\./);
        
        if (parts.length > 1) {
            obj = obj[parts[0]];
            parts.shift();
            return this.getValue(obj, parts.join('.'), type, fallback);
        } else {
            var value = obj[property];

            if (Ext.isString(type)) {
                return Ext.typeOf(value) == type ? value : fallback;
            } else {
                return Ext.isDefined(value) ? value : fallback;
            }
        }
    },
    
});
