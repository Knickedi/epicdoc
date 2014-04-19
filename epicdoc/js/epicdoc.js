
Ext.onReady(function() {
    
    function load() {
        var scripts = [
            'func/LiveUpdater',
            'global/App',
            'global/Config',
            'global/Data',
            'global/Log',
            'util/JS',
            'view/dataidfield',
            'view/sectionwindow',
            'view/viewport'
        ];
        
        ED.util.ResourceLoader.loadScripts({
            stopOnFail: true,
            paths: scripts,
            prefix: 'epicdoc/js/', 
            finish: function() {
                ED.App.init();
            },
            fail: function(path) {
                alert('Failed to load ' + path);
            }
        });
    }
    
    document.head.appendChild(Ext.apply(document.createElement('script'), {
        type: 'text/javascript',
        src: 'epicdoc/js/util/ResourceLoader.js',
        onload: load,
        onerror: function() {
            alert('Failed to load ResourceLoader.js');
        }
    }));
    
});
