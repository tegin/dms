odoo.define('dms_field.DocumentFileSelectionDialog', function(require) {
"use strict";

var core = require('web.core');

var DocumentSelectionDialog = require('dms_field.DocumentSelectionDialog');
var DocumentTreeDialogView = require('dms_field.DocumentTreeDialogView');

var _t = core._t;
var QWeb = core.qweb;

var DocumentFileSelectionDialog = DocumentSelectionDialog.extend({
	default_options: {
        view: {
        	view: DocumentTreeDialogView,
        	options: {
	        	key: "dms_files_finder",
	        	disable_multiple: true,
	        	contextmenu: false,
        		filesOnly: true,
	        	model: {
	        		noSettings: true,
	        	}
	        },
        }
    },
	init: function (parent, options) {
		this._super(parent, _.extend({}, this.default_options, options));
	}
});

return DocumentFileSelectionDialog;

});