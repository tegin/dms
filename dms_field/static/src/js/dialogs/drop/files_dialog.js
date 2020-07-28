odoo.define('dms_field.DocumentDropFilesDialog', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var session = require('web.session');

var DocumentDropDialog = require('dms_field.DocumentDropDialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentDropFilesDialog = DocumentDropDialog.extend({
	init: function (parent, options) {
    	this.options = options || {};
    	this._super(parent, _.extend({}, {
            title: _t("Upload Files into: ") + this.options.name || "",
            save: _t("Upload"),
            $form: "#mk_document_upload",
            $content: $(QWeb.render("muk_dms.DocumentDropFilesDialog", {
            	url: "/dms/upload/file/" + this.options.id,
            	csrf_token:	core.csrf_token,
            })),
            dropzone: {
            	maxFiles: 25,
            	parallelUploads: 25,
            	init: function() {
            		this.on("addedfile", function() {
            			if (this.files[25] != null){
            				this.removeFile(this.files[0]);
            			}
            		});
            	}
            }
        }, this.options));
    },
});

return DocumentDropFilesDialog;

});