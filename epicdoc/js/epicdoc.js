(function() {
    
    rawLoadScript('epicdoc/extjs/ext-all.js', function() {
        defineResourceLoader();
        
        loadStyles(function() {
            loadScripts(function() {
                Ext.onReady(function() {
                    ED.App.init();
                });
            })
        })
    });

    function rawLoadScript(path, success, fail) {
        var script = document.createElement('script');
        
        script.type = 'text/javascript';
        script.src = path;
        script.onload = success;
        script.onerror = fail || function() {
            alert('Failed to load ' + path);
        };
        
        document.head.appendChild(script);
    }
    
    function loadStyles(finish) {
        var styles = [
            'extjs/ext-theme-neptune-all',
            'css/epiceditor-html',
            'css/epicdoc',
        ];

        ED.util.ResourceLoader.loadStyles({
            stopOnFail: true,
            paths: styles,
            prefix: 'epicdoc/', 
            finish: finish,
            fail: function(path) {
                alert('Failed to load ' + path);
            }
        });
    }

    function loadScripts(finish) {
        var scripts = [
            'epiceditor',
            'idbstore',
            'global/App',
            'global/Config',
            'global/Data',
            'global/Log',
            'global/Server',
            'global/Storage',
            'util/JS',
            'view/codepanel',
            'view/edit.sectionwindow',
            'view/epiceditor',
            'view/formwindow',
            'view/licensewindow',
            'view/new.contentwindow',
            'view/new.sectionwindow',
            'view/storagewindow',
            'view/viewport'
        ];

        ED.util.ResourceLoader.loadScripts({
            stopOnFail: true,
            paths: scripts,
            prefix: 'epicdoc/js/', 
            finish: finish,
            fail: function(path) {
                alert('Failed to load ' + path);
            }
        });
    }
    
    function defineResourceLoader() {
        Ext.define('ED.util.ResourceLoader', {
            singleton: true,
            
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
    }
    
})();