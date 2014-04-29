(function() {
    
    rawLoadScript('epicdoc/extjs/ext-all.js', function() {
        rawLoadScript('epicdoc/js/util/ResourceLoader.js', loadStyles, function() {
            alert('Failed to load ResourceLoader.js');
        });
    }, function() {
        alert('Failed to load ext-all.js');
    })
    
    function loadStyles() {
        var styles = [
            'extjs/ext-theme-neptune-all',
            'css/epiceditor-html',
            'css/epicdoc',
        ];

        ED.util.ResourceLoader.loadStyles({
            stopOnFail: true,
            paths: styles,
            prefix: 'epicdoc/', 
            finish: function() {
                loadScripts();
            },
            fail: function(path) {
                alert('Failed to load ' + path);
            }
        });
    }

    function loadScripts() {
        var scripts = [
            //'lawnchair',
            //'lawnchair.indexeddb',
            'js/epiceditor',
            'js/func/LiveUpdater',
            'js/global/App',
            'js/global/Config',
            'js/global/Data',
            'js/global/Log',
            'js/util/JS',
            'js/view/codepanel',
            'js/view/edit.sectionwindow',
            'js/view/epiceditor',
            'js/view/formwindow',
            'js/view/licensewindow',
            'js/view/new.contentwindow',
            'js/view/new.sectionwindow',
            'js/view/viewport'
        ];

        ED.util.ResourceLoader.loadScripts({
            stopOnFail: true,
            paths: scripts,
            prefix: 'epicdoc/', 
            finish: function() {
                Ext.onReady(function() {
                    ED.App.init();
                });
            },
            fail: function(path) {
                alert('Failed to load ' + path);
            }
        });
    }
    
    function rawLoadScript(path, success, fail) {
        var script = document.createElement('script');
        
        script.type = 'text/javascript';
        script.src = path;
        script.onload = success;
        script.onerror = function() {
            alert('Failed to load ' + path);
        };
        
        document.head.appendChild(script);
    }
    
})();