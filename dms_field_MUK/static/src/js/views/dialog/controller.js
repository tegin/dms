odoo.define('dms_field_muk.DocumentsDialogController', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var config = require('web.config');
var session = require('web.session');
var web_client = require('web.web_client');
var framework = require('web.framework');
var crash_manager = require('web.crash_manager');

var DocumentsController = require('dms_field_muk.DocumentsController');

var _t = core._t;
var QWeb = core.qweb;

var DocumentsDialogController = DocumentsController.extend({
    _loadContextMenuDirectory: function($jstree, node, menu) {
    	var self = this;
    	menu = this._super($jstree, node, menu);
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
						function create() {
							self._createDirecotry(node).done(function(result) {
								$jstree.create_node(node, result, "last", function (new_node) {
									try {
										$jstree.edit(new_node);
									} catch (ex) {
										setTimeout(function () {
											$jstree.edit(new_node); 
										}, 0);
									}
								});
							}).fail(function() {
								self.do_warn(_t("Directory couldn't be created!"));
								self.refresh();
							});
						}
						if(!$jstree.is_open(node)) {
							$jstree.open_node(node, create);
						} else {
							create();
						}
					},
					_disabled: function (data) {
		    			return !node.data.perm_create;
	    			},
				},
			}	
		};
    	return menu;
    },
});

return DocumentsDialogController;

});