
Ext.define('ED.util.ResourceLoader', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	singleton: true,
	
	// PUBLIC ----------------------------------------------------------------------------------------
	
	loadScripts: function(cfg) {
		this.load(Ext.apply(cfg || {}, {
			extension: 'js',
			domCreate: function(path) {
				return Ext.apply(document.createElement('script'), {
					type: 'text/javascript',
					src: path
				});
			}
		}));
	},
	
	loadStyles: function(cfg) {
		this.load(Ext.apply(cfg || {}, {
			extension: 'css',
			domCreate: function(path) {
				return Ext.apply(document.createElement('link'), {
					rel: 'stylesheet',
					type: 'text/css',
					href: path
				});
			}
		}));
	},
	
	// PRIVATE ---------------------------------------------------------------------------------------
	
	load: function(cfg) {
		var me = this,
			paths = Ext.Array.from(cfg.paths);
		
		if (paths.length == 0) {
			(cfg.finish || Ext.emptyFn)();
		} else {
			var path = (cfg.prefix || '') + paths[0] + '.' + cfg.extension,
				el = cfg.domCreate(path);
				
			var loadNext = function() {
				el.onload = null;
				paths.shift();
				me.load(Ext.apply(cfg, { paths: paths}));
			};
			
			document.head.appendChild(Ext.apply(el, {
				onload: function() {
					(cfg.success || Ext.emptyFn)(path);
					loadNext();
				},
				onerror: function() {
					el.onload = null;
					(cfg.fail || Ext.emptyFn)(path);
					
					if (!cfg.stopOnFail) {
						loadNext();
					}
				}
			}));
		}
	},
});
