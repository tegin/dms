odoo.define('dms_field_muk.DocumentDirectorySelectionDialog', function(require) {
"use strict";

var core = require('web.core');

var DocumentSelectionDialog = require('dms_field_muk.DocumentSelectionDialog');
var DocumentTreeDialogView = require('dms_field_muk.DocumentTreeDialogView');

var _t = core._t;
var QWeb = core.qweb;

var DocumentDirectorySelectionDialog = DocumentSelectionDialog.extend({
	default_options: {
        view: {
        	view: DocumentTreeDialogView,
        	options: {
	        	key: "dms_directories_finder",
	        	disable_multiple: true,
	        	model: {
	        		noSettings: true,
	        		directoriesOnly: true,
	        	}
	        },
        }
    },
	init: function (parent, options) {
		this._super(parent, _.extend({}, this.default_options, options));
	}
});

return DocumentDirectorySelectionDialog;

});