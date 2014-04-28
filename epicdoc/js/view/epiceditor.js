
Ext.define('ED.view.EpicEditor', {
	
	// ATTRIBUTES ------------------------------------------------------------------------------------
	
	extend: 'Ext.Component',
	alias: 'widget.edepiceditor',
	
	// STATIC ----------------------------------------------------------------------------------------
	
	statics: {
		
		getEditor: function(rawContent) {
			var me = this,
				closeFn = Ext.bind(me.closeEditMode, me, [true]);
			
			if (!me.editor) {
				me.editorEl = Ext.DomHelper.append(Ext.getBody(),
					'<div style="position:absolute; top: 100000px; left:100000px" id="epiceditor-temp"></divv>');
				me.textareaEl = Ext.DomHelper.append(Ext.getBody(),
					'<textarea style="position:absolute; top: 100000px; left:100000px" id="epiceditor-text"></textarea>');
				
				me.createEditor('epiceditor-temp');

				me.window = Ext.widget('window', {
					minWidth: 640,
					minHeight: 480,
					layout: 'fit',
					title: ED.lang.markdownLiveEditor,
					maximizable: true,
					modal: true,
					constrain: true,
					closeAction: 'hide',
					onEsc: closeFn,
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'bottom',
						ui: 'footer',
						items: [{
							xtype: 'component',
							flex: 1
						}, {
							xtype: 'button',
							minWidth: 100,
							text: ED.lang.save,
							handler: Ext.bind(me.closeEditMode, me, [false])
						}, {
							xtype: 'button',
							minWidth: 100,
							text: ED.lang.cancel,
							handler: closeFn
						}]
					}],
					items: {
						xtype: 'component',
						listeners: {
							render: function() {
								var temp = Ext.get('epiceditor-temp').dom;
								temp.parentNode.removeChild(temp);
								me.createEditor(this.el.dom.id);
							},
							resize: function() {
								var body = me.window.el.child('.x-window-body'),
									frame = body.select('iframe'),
									width = body.getWidth(),
									height = body.getHeight();
									
								function apply(type, styles) {
									return Ext.get(me.editor.getElement(type)).applyStyles(styles);
								}
								
								apply('wrapper', { position: 'absolute', height: '100%', width: '100%' });
								apply('wrapperIframe', { width: width + 'px', height: height + 'px' });
								apply('editorIframe', { position: 'absolute', top: '0px', left: '0px', height: '100%', width: '50%' });
								apply('previewerIframe', { position: 'absolute', top: '0px', left: '50%', height: '100%', width: '50%' });
							},
						}
					},
					listeners: {
						close: closeFn,
						show: function() {
							Ext.defer(function() {
								me.editor.getElement('editor').body.focus();
							}, 250);
						}
					}
				});
			}
			
			me.editor.importFile(null, rawContent);
			me.editor.preview();
			
			return me.editor;
		},
		
		createEditor: function(id) {
			var me = this;
			
			me.editor = new EpicEditor({
				container: id,
				textarea: 'epiceditor-text',
				basePath: '',
				useNativeFullscreen: false,
				clientSideStorage: false,
				theme: {
					base: 'epicdoc/css/epiceditor.css',
					preview: 'epicdoc/css/epiceditor-html.css',
					editor: 'epicdoc/css/epiceditor-code.css'
				},
			});
			me.editor.load();
			me.editor.enterFullscreen();
			
			var body = me.editor.getElement('previewer').body;
			body.className = 'epiceditor-preview-body';
			body.children[0].className = 'epiceditor-preview';
		},
		
		getRenderedContent: function(rawContent) {
			return this.getEditor(rawContent).getElement('previewer').body;
		},
		
		closeEditMode: function(cancel) {
			var me = this,
				content = me.textareaEl.value;
			
			if (cancel) {
				if (me.rawContent != content) {
					Ext.Msg.alert('tue doch was!');
				} else {
					me.window.hide();
				}
			} else {
				Ext.callback(me.callback, window, [
					me.textareaEl.value,
					me.editor.getElement('previewer').body
				]);
				me.window.hide();
			}
		},
		
		openEditMode: function(rawContent, targetEl, callback) {
			var me = this;
			
			if (ED.App.isEditable()) {
				me.rawContent = rawContent;
				me.callback = callback;
				me.getEditor(rawContent);
				me.window.animateTarget = targetEl;
				me.window.show();
			}
		}
	},
	
	onRender: function() {
		var me = this,
			editBtn = new Ext.Element(document.createElement('div'));
		
		me.callParent();
		
		//me.el = new Ext.Element(document.createElement('div'));
		
		me.editBtn = editBtn;
		editBtn.addCls('ed-icon-edit');
		editBtn.applyStyles({
			width: '20px',
			height: '20px',
			float: 'right',
			cursor: 'pointer',
			display: ED.App.isEditable() ? 'block' : 'none'
		});
		editBtn.on('click', function() {
			me.instance.openEditMode(me.content || '', this.el, function(content, body) {
				me.content = content;
				
				me.updateEl(body);
				
				Ext.callback(me.callback, window, [content, body]);
			});
		});
		
		me.updateEl(me.instance.getRenderedContent(me.content || ''));
	},
	
	updateEl: function(body) {
		var me = this,
			el = me.el,
			domNode = body.children[0].cloneNode(true);
			
		domNode.id = "";
		
		var node = new Ext.Element(domNode);
		
		node.addCls('epiceditor-preview');
		
		el.update('');
		
		if (me.editable !== false && ED.App.isEditable()) {
			el.appendChild(me.editBtn);
		}
		
		el.appendChild(node);
		
		me.minHeight = node.getHeight();
		
		if (me.minHeight < 20)
			me.minHeight = 20;
		
		me.setSize(null, me.minHeight);
	},
	
	// PRIVATE ---------------------------------------------------------------------------------------
	
	constructor: function(cfg) {
		var me = this;
		
		me.instance = ED.view.EpicEditor;
		
		me.callParent([Ext.apply(cfg || {}, {
			border: false
		})]);
	},
});
