
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
    
    getScrollbarWidth: function() {
        if (!this.scrollbarWidth) {
            var outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            var widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            var inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);        

            var widthWithScroll = inner.offsetWidth;

            // remove divs
            outer.parentNode.removeChild(outer);

            this.scrollbarWidth = widthNoScroll - widthWithScroll;
        }
        
        return this.scrollbarWidth;
    }
});
