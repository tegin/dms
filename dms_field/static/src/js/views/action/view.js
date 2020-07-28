odoo.define('dms_field.ActionDocumentTreeView', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');

var ControlPanelMixin = require('web.ControlPanelMixin');

var DocumentsModel = require('dms_field.DocumentsModel');
var DocumentsRenderer = require('dms_field.DocumentsRenderer');
var DocumentsViewController = require('dms_field.DocumentsViewController');
var DocumentTreeView = require('dms_field.DocumentTreeView');

var _t = core._t;
var QWeb = core.qweb;

var ActionDocumentTreeView = DocumentTreeView.extend(ControlPanelMixin, {
	custom_events: _.extend({}, DocumentTreeView.prototype.custom_events, {
		reverse_breadcrumb: '_on_reverse_breadcrumb',
    }),
	config: {
		DocumentsModel: DocumentsModel,
		DocumentsRenderer: DocumentsRenderer,
		DocumentsController: DocumentsViewController,
	},
    _update_cp: function() {
    	var self = this;
    	if (!this.$searchview) {
            this.$searchview = $(QWeb.render('muk_dms.DocumentTreeViewSearch', {
                widget: this,
            }));
            this.$searchview.find('#mk_searchview_input').keyup(this._trigger_search.bind(this));
        }
        this.update_control_panel({
            cp_content: {
                $searchview: this.$searchview,
            },
            breadcrumbs: this.getParent().get_breadcrumbs(),
        });
    },    
    _on_reverse_breadcrumb: function() {
        web_client.do_push_state({});
        this._update_cp();
        this.controller.refresh();
    },
    _trigger_search: _.debounce(function() {
		var val = this.$searchview.find('#mk_searchview_input').val();
    	this.controller.search(val);
    }, 200),
});

return ActionDocumentTreeView;

});