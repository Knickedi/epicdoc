
Ext.define('ED.view.LicenseWindow', {

    // ATTRIBUTES ---------------------------------------------------------------------------------
    
    extend: 'Ext.window.Window',
    alias: 'widget.edlicensewindow',
    
    // PRIVATE ------------------------------------------------------------------------------------
    
    constructor: function(cfg) {
        var me = this;
        
        me.callParent([Ext.apply(cfg || {}, {
            title: ED.lang.license,
            closeAction: 'destroy',
            modal: true,
            minWidth: 640,
            maxHeight: 480,
            bodyPadding: 20,
            overflowY: 'auto',
            constrain: true,
            resizable: false,
            items: {
                xtype: 'edepiceditor',
                editable: false,
                content: [
                    '## ' + ED.App.appTitle + ' v' + ED.App.appVersion,
                    '[EpicDoc](https://github.com/Knickedi/epicdoc) is meant to be OpenSource under [GPL3](http://www.gnu.org/licenses/gpl-3.0.html) conditions.  ',
                    'CopyRight (c) 2014 Viktor Reiser &lt;<a href="mailto:viktorreiser@gmx.de">viktorreiser@gmx.de</a>&gt;  ',
                    '',
                    'Sincere thanks to Oscar Godson for [EpicEditor](https://github.com/OscarGodson/EpicEditor) and all authors of [Ext JS](http://www.sencha.com/products/extjs/).',
                    '',
                    'You can find the original source code on [GitHub](https://github.com/Knickedi/epicdoc).  ',
                     'You can contact the developers, contribute to the project or report bugs on [GitHub](https://github.com/Knickedi/epicdoc/issues).  ',
                    'If you received a modified version you have the right to ask the author for the source code.  ',
                    'Every EpicDoc version has to include this license information!',
                    '',
                    '__Image attribution__',
                    '',
                    'folder-open.png, folder-close.png, document.png (modified) | Creative Commons | [iOS 7 icons by Visual Pharm](https://www.iconfinder.com/iconsets/ios-7-icons#readme)  ',
                    'code.png, add.png | Creative Commons | [Picol Vector by PICOL](https://www.iconfinder.com/iconsets/picol-vector#readme)  ',
                    'server.png | Creative Commons | [WPZOOM Developer Icon Set by WPZOOM](https://www.iconfinder.com/iconsets/wpzoom-developer-icon-set#readme)  ',
                    'edit.png, delete.png | Free for commercial use | [Streamline - Free by Webaly](https://www.iconfinder.com/iconsets/streamline-icon-set-free-pack#readme)  ',
                    'book.png | Free for commercial use | [Internet and web by Popcic](https://www.iconfinder.com/iconsets/internet-and-web-4#readme)'
                ].join('\n')
            }
        })]);
    }
});
