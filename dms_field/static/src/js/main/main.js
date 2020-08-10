odoo.define('dms.DmsTreeSplitter', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');
var framework = require('web.framework');
var crash_manager = require('web.crash_manager');

var Widget = require('web.Widget');
var Dialog = require('web.Dialog');

var ActionDocumentTreeView = require('dms.DmsTreeView');
//var PreviewManager = require('dms_field_muk.PreviewManager');
//var PreviewDialog = require('dms_field_muk.PreviewDialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentTreeMainView = ActionDocumentTreeView.extend({
	cssLibs: [
        '/dms_field/static/lib/jquery-splitter/css/jquery.splitter.css',
    ],
    jsLibs: [
        '/dms_field/static/lib/jquery-splitter/js/jquery.splitter.js',
    ],
    custom_events: _.extend({}, ActionDocumentTreeView.prototype.custom_events, {
    	tree_ready: '_treeReady',
    	tree_changed: '_treeChanged',
    }),
	template: 'dms.DocumentTreeView',
	init: function(parent, action) {
        this._super(parent, _.extend({}, {
        	key: "dms_documents",
	    }), action);
        this.controller.params.action_open_dialog = this._get_storage('dms_documents_open_dialog');
    },
    start: function () {

        return $.when(this._super.apply(this, arguments))
            .then(this._update_cp.bind(this))
            .then(this._update_view.bind(this));
    },
    _update_view: function() {
    	this.controller.appendTo(this.$('.mk_treeview'));
    },
    willStart: function() {
        return $.when(ajax.loadLibs(this), this._super.apply(this, arguments));
    },

    _get_storage: function(key) {
    	return this.call('local_storage', 'getItem', key);
    },

    _set_storage: function(key, value) {
    	this.call('local_storage', 'setItem', key, value);
    },

    _preview_node: function(node) {
    	var self = this;
    	if(node.data && node.data.odoo_model === "dms.file") {
    		if (this.manager) {
    			this.manager.destroy();
    		}
    		
    		var binary_url = session.url('/web/content', {
                model: "dms.file",
                id: JSON.stringify(node.data.odoo_id),
                filename: node.text,
                field: "content",
                download: true,
            });
    		console.log(node)
            /*this.manager = new PreviewManager(
        		this, [{
        			url: binary_url,
        			filename: node.text,
        			mimetype: node.data && node.data.mimetype,
        		}], 0
            );
            this.$('.mk_document_preview').empty();
            this.manager.appendTo(this.$('.mk_document_preview'));*/
    	} else if(node.data && node.data.odoo_model === "dms.directory") {
    		self.$el.find('.mk_document_preview').html(
    				$(QWeb.render('muk_dms.DocumentTreeViewDirectoryPreview', {
			            widget: this,
			            directory: node.data,
    				})));
    	}
    },
    _open_selected_node: function() {
        var node = this.controller.getSelectedItem();
        if(node) {
            this.controller._openNode(node);
        }
    },
    _create_selected_node: function() {
        var node = this.controller.getSelectedItem();
        if(node) {
            var parent = node.data.odoo_model === "dms.file" ? this.controller.getParentNode(node) : node;
            this.controller._createNode(parent, node.data.odoo_model);
        }
    },
    _edit_selected_node: function() {
        var node = this.controller.getSelectedItem();
        if(node) {
            this.controller._editNode(node);
        }
    },
    _delete_selected_node: function() {
        var nodes = this.controller.getTopSelectedItems();
        if(nodes.length > 0) {
            this.controller._deleteNodes(nodes);
        }
    },
    _show_help: function() {
        var buttons = [{
            text: _t("Ok"),
            close: true,
        }];
        var dialog = new Dialog(this, {
            size: 'medium',
            buttons: buttons,
            $content: $(QWeb.render('dms.DocumentHelpDialogContent')),
            title: _t("Help"),
        });
        dialog.open();
    },
    refresh: function(message) {
        if(this._get_storage('dms_documents_auto_refresh')) {
            this.controller.refresh(message);
        }
    },
    _update_cp: function() {
        var self = this;
        console.log("Here")
        if (!this.$buttons) {
            this.$buttons = $(QWeb.render('dms.DocumentTreeViewButtons', {
                widget: this,
            }));
            this.$buttons.find('.mk_open').on('click', _.bind(this._open_selected_node, this));
            this.$buttons.find('.mk_create').on('click', _.bind(this._create_selected_node, this));
            this.$buttons.find('.mk_edit').on('click', _.bind(this._edit_selected_node, this));
            this.$buttons.find('.mk_delete').on('click', _.bind(this._delete_selected_node, this));
        }
        console.log("Ieeeeeepa")
        if (!this.$pager) {
            this.$pager = $(QWeb.render('dms.DocumentTreeViewActions', {
                widget: this,
            }));
            this.$pager.find('.mk_action_help').on('click', _.bind(this._show_help, this));
            this.$pager.find('.mk_refresh').on('click', _.bind(this.refresh, this));
        }
        this.update_control_panel({
            cp_content: {
                $buttons: this.$buttons,
                $pager: this.$pager,
            },
        });
    },
});

core.action_registry.add('muk_dms_view.documents', DocumentTreeMainView);

return DocumentTreeMainView;

});