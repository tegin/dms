odoo.define('dms_field.DocumentTreeDialogView', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');

var Widget = require('web.Widget');
var Dialog = require('web.Dialog');
var ControlPanelMixin = require('web.ControlPanelMixin');

var DocumentsModel = require('dms_field.DocumentsModel');
var DocumentsRenderer = require('dms_field.DocumentsRenderer');
var DocumentsDialogController = require('dms_field.DocumentsDialogController');

var _t = core._t;
var QWeb = core.qweb;

var DocumentTreeDialogView = Widget.extend({
	template: 'muk_dms.DocumentDialog',
	init: function(parent, params) {
		this._super.apply(this, arguments);
        this.controller = new DocumentsDialogController(this,
        	DocumentsModel, DocumentsRenderer,
        	_.extend({}, {
	        	dnd: false,
	        	contextmenu: true,
        	}, params));
    },
    start: function () {
        return $.when(this._super.apply(this, arguments))
	        .then(this._update_cp.bind(this))
	     	.then(this._update_view.bind(this));
    },
    _update_cp: function() {
    	this.$('#mk_searchview_input').keyup(this._trigger_search.bind(this));
    },
    _update_view: function() {
    	this.controller.appendTo(this.$('.mk_treeview'));
    },
    _trigger_search: _.debounce(function() {
		var val = this.$('#mk_searchview_input').val();
    	this.controller.search(val);
    }, 200),
});

return DocumentTreeDialogView;

});