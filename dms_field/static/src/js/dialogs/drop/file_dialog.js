odoo.define('dms_field.DocumentDropFileDialog', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var session = require('web.session');

var DocumentDropDialog = require('dms_field.DocumentDropDialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentDropFileDialog = DocumentDropDialog.extend({
	init: function (parent, options) {
    	this.options = options || {};
    	var buttons = [{
            text:  _t("Replace File"),
            classes: 'btn-primary',
            close: true,
            click: this._save.bind(this),
        }, {
            text: _t("Replace Content"),
            classes: 'btn-primary',
            close: true,
            click: this._replace.bind(this),
        }, {
            text: _t("Cancel"),
            close: true,
        }];
    	this._super(parent, _.extend({}, {
            title: _t("Replace File: ") + this.options.name || "",
            buttons: buttons,
            $form: "#mk_document_replace",
            $content: $(QWeb.render("muk_dms.DocumentDropFileDialog", {
            	url: "/dms/replace/file/" + this.options.id,
            	csrf_token:	core.csrf_token,
            })),
            dropzone: {
            	maxFiles: 1,
            	init: function() {
            		this.on("addedfile", function() {
            			if (this.files[1] != null){
            				this.removeFile(this.files[0]);
            			}
            		});
            	}
            },
        }, this.options));
    },
    _replace: function() {
    	var dropzone = this.dropzone.get(0).dropzone;
    	dropzone.options.params = {
    		content_only: true,
    	};
    	dropzone.processQueue();
    },
});

return DocumentDropFileDialog;

});