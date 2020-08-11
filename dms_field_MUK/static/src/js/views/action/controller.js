odoo.define('dms_field_muk.DocumentsViewController', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');
var framework = require('web.framework');
var crash_manager = require('web.crash_manager');

var DocumentsController = require('dms_field_muk.DocumentsController');
var DocumentFileInfoDialog = require('dms_field_muk.DocumentFileInfoDialog');
var DocumentDirectoryInfoDialog = require('dms_field_muk.DocumentDirectoryInfoDialog');
var DocumentDropFileDialog = require('dms_field_muk.DocumentDropFileDialog');
var DocumentDropFilesDialog = require('dms_field_muk.DocumentDropFilesDialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentsViewController = DocumentsController.extend({
    _loadContextMenuBasic: function($jstree, node, menu) {
    	var self = this;
    	menu.info = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-info",
			label: _t("Info"),
			action: function (data) {
				self._openInfo(node);
			},
		};
    	menu.open = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-external-link",
			label: _t("Open"),
			action: function (data) {
				self._openNode(node);
			},
		};
    	menu.edit = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-pencil-square-o",
			label: _t("Edit"),
			action: function (data) {
				self._editNode(node);
			},
			_disabled: function (data) {
    			return !node.data.perm_write;
			},
		};
    	return this._super($jstree, node, menu);
    },
    _loadContextMenuDirectory: function($jstree, node, menu) {
    	var self = this;
    	menu = this._super($jstree, node, menu);
    	menu.upload = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-upload",
			label: _t("Upload"),
			action: function(data) {
				self._uploadFilesDialog(node);
			},
	    	_disabled: function (data) {
				return !node.data.perm_create;
			},
    	};
    	menu.create = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-plus",
			label: _t("Create"),
			action: false,
			submenu: {
				directory: {
					separator_before: false,
					separator_after: false,
					label: _t("Directory"),
					icon: "fa fa-folder-o",
					action: function(data) {
						self._createNode(node, "dms.directory");
					},
					_disabled: function (data) {
		    			return !node.data.perm_create;
	    			},
				},
				file : {
					separator_before: false,
					separator_after: false,
					label: _t("File"),
					icon: "fa fa-file-o",
					action: function(data) {
						self._createNode(node, "dms.file");
					},
					_disabled: function (data) {
		    			return !node.data.perm_create;
	    			},
				},
			}	
		};
    	return menu;
    },
    _loadContextMenuFile: function($jstree, node, menu) {
    	var self = this;
    	menu.replace = {
			separator_before: false,
			separator_after: false,
			icon: "fa fa-retweet",
			label: _t("Replace"),
			action: function(data) {
				self._replaceFile(node);
			},
	    	_disabled: function (data) {
				return !node.data.perm_write;
			},
    	};
    	var operations = {};
    	_.each(node.data.actions, function(action, index, list) {
    		operations['operation_' + action[0]] = {
				separator_before: false,
				separator_after: false,
				label: action[1],
				icon: "fa fa-gear",
				action: function(data) {
					self._executeOperation(node, action[0]);
				},
    		};
    	});
    	if (!_.isEmpty(operations)) {
	    	menu.operation = {
				separator_before: false,
				separator_after: false,
				icon: "fa fa-gears",
				label: _t("Operation"),
				action: false,
				submenu: operations,
			};
    	}
    	return this._super($jstree, node, menu);
    },
});

return DocumentsViewController;

});