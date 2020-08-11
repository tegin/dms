odoo.define('dms_field_muk.DocumentTreeView', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');

var Dialog = require('web.Dialog');
var AbstractAction = require('web.AbstractAction');
var ControlPanelMixin = require('web.ControlPanelMixin');

var DocumentsModel = require('dms_field_muk.DocumentsModel');
var DocumentsRenderer = require('dms_field_muk.DocumentsRenderer');
var DocumentsController = require('dms_field_muk.DocumentsController');

var _t = core._t;
var QWeb = core.qweb;

var DocumentTreeView = AbstractAction.extend({
	config: {
		DocumentsModel: DocumentsModel,
		DocumentsRenderer: DocumentsRenderer,
		DocumentsController: DocumentsController,
	},
	init: function(parent, params, action) {
		this._super.apply(this, arguments);
		var settings = $.extend(true, {}, {
			dnd: true, contextmenu: true,
        }, params || {}, action.params && action.params || {})
		this.controller = new this.config.DocumentsController(this,
			this.config.DocumentsModel, this.config.DocumentsRenderer, settings
        );
    },
    reload: function(message) {
    	this.refresh(message);
    },
    refresh: function(message) {
    	this.controller.refresh(message);
    },
    start: function () {
        return $.when(this._super.apply(this, arguments))
	        .then(this._update_cp.bind(this))
	     	.then(this._update_view.bind(this));
    },
    _update_cp: function() {
    },
    _update_view: function() {
    	this.controller.appendTo(this.$('.mk_treeview'));
    },
});

return DocumentTreeView;

});