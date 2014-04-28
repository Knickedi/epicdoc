
Ext.define('ED.App', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.util.Observable',
	singleton: true,
	
	supportedExtLanguages: [
		'af'   , 'bg'   , 'ca'   , 'cs'   , 'da'   , 'de'   , 'el_GR', 'en'   , 'en_AU', 'en_GB',
		'es'   , 'et'   , 'fa'   , 'fi'   , 'fr'   , 'fr_CA', 'gr'   , 'he'   , 'hr'   , 'hu'   ,
		'id'   , 'it'   , 'ja'   , 'ko'   , 'lt'   , 'lv'   , 'mk'   , 'nl'   , 'no_NB', 'no_NN',
		'pl'   , 'pt'   , 'pt_BR', 'pt_PT', 'ro'   , 'ru'   , 'sk'   , 'sl'   , 'sr'   , 'sr_RS',
		'sv_SE', 'th'   , 'tr'   , 'ukr'  , 'vn'   , 'zh_CN', 'zh_TW'
	],
	
	supportedEpicDocLanguages: [
		'en'
	],
	
	appTitle: 'EpicDoc',
	appVersion: '0.1',
	
	// PUBLIC ----------------------------------------------------------------------------------------
	
	getTitle: function() {
		return ED.Config.getString('title') || this.appTitle;
	},
	
	getSubTitle: function() {
		var subtitle = ED.Config.getString('subtitle');
		return Ext.isString(subtitle) ? subtitle : 'v' + this.appVersion
	},
	
	isEditable: function() {
		return Ext.Object.getSize(this.editable);
	},
	
	setEditable: function(type, editable) {
		var me = this;
		
		me.editable = me.editable || {};
		
		if (editable) {
			me.editable[type] = true;
		} else {
			delete me.editable[type];
		}
		
		me.viewport.setEditable(me.isEditable());
	},
	
	updateLanguage: function(callback) {
		var me = this,
			language = ED.Config.getString('language', 'en').toLowerCase(),
			extLanguages = me.supportedExtLanguages.map(function(lang) { return lang.toLowerCase(); }),
			epicdocLanguages = me.supportedEpicDocLanguages.map(function(lang) { return lang.toLowerCase(); }),
			scripts = [];
		
		scripts.push('extjs/lang/ext-lang-' + (extLanguages[extLanguages.indexOf(language)] || 'en'));
		scripts.push('js/lang/en'); 
		
		if (language != 'en') {
			var lang = epicdocLanguages[epicdocLanguages.indexOf(language)];
			
			if (lang) {
				scripts.push('js/lang/' + lang); 
			}
		}
			
		ED.Log.d('Loading language files:', scripts);
		
		ED.util.ResourceLoader.loadScripts({
			paths: scripts,
			prefix: 'epicdoc/',
			finish: function() {
				Ext.callback(callback);
			},
			fail: function(path) {
				ED.Log.e('Language file missing:', path);
			}
		});
	},
	
	updateView: function() {
		var me = this;
		
		if (me.viewport) {
			me.viewport.destory();
		}
		
		ED.Log.d('Creating application view')
		me.viewport = Ext.widget('edviewport');
	},
	
	// INITIALIZATION --------------------------------------------------------------------------------

	constructor: function() {
		var me = this;
		
        me.callParent();
	},
	
	init: function() {
		var me = this;
		
		// browsers have a strange behaviour when selecting text
		// the scroll the viewport (the whole HTML-body) out of bounds, we avoid that
		Ext.get(window).on('scroll', function() { window.scrollTo(0, 0); });
		
		me.debug = !!(window.epicconfig && window.epicconfig.debug);
		ED.Log.d('Initializing application');
		
		Ext.QuickTips.init();
		
		ED.Data.init(function() {
			ED.Config.init(function() {
				me.updateLanguage(function() {
					me.updateView();
					
					var liveUpdater = ED.func.LiveUpdater;
					liveUpdater.on('online', function(online) {
						Ext.ComponentQuery.query('[edLiveUpdater]').forEach(function(cmp) {
							cmp.setVisible(!online);
						});
					});
					liveUpdater.init();
				});
			});
		});
		
	},
	
});
