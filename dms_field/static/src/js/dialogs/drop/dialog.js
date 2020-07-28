odoo.define('dms_field.DocumentDropDialog', function(require) {
"use strict";

var ajax = require('web.ajax');
var core = require('web.core');
var session = require('web.session');

var Dialog = require('web.Dialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentDropDialog = Dialog.extend({
	cssLibs: [
        '/dms_field/static/lib/dropzone/dropzone.css',
    ],
    jsLibs: [
        '/dms_field/static/lib/dropzone/dropzone.js',
    ],
	init: function (parent, options) {
    	this.options = options || {};
    	var buttons = [{
            text: this.options.save || _t("Save"),
            classes: 'btn-primary',
            close: true,
            click: this._save.bind(this),
        }, {
            text: _t("Cancel"),
            close: true,
        }];
        this._super(parent, _.extend({}, {
            size: "medium",
            buttons: buttons,
        }, this.options));
    },
    willStart: function() {
    	var self = this;
		var load_max_upload_size = this._rpc({
            route: '/config/muk_web_utils.binary_max_size',
        }).done(function(result) {
        	self.max_upload_size = result.max_upload_size;
        });
		var load_forbidden_extensions = this._rpc({
            route: '/config/muk_dms.forbidden_extensions',
        }).done(function(result) {
        	self.forbidden_extensions = result.forbidden_extensions;
        });
        return $.when(ajax.loadLibs(this), this._super.apply(this, arguments),
    		load_forbidden_extensions, load_max_upload_size);
    },
    start: function() {
    	var self = this;
    	this.dropzone = this.$(this.options.$form).dropzone(_.extend({}, {
    		autoProcessQueue: false,
    		maxFilesize: this.max_upload_size || null,
    		accept: function(file, done) {
    			if(self.forbidden_extensions) {
    				var extensions = self.forbidden_extensions.split(",");
					if(_.some(extensions, function(extension) { 
						return file.name.endsWith(extension); 
					})) {
						done(_t("The file has a forbidden file extension."));
					} else {
	    				done();
	    			}
    			} else {
    				done();
    			}
    		}
        }, this.options.dropzone));
    	this.dropzone.get(0).dropzone.on("queuecomplete", function (file) {
    		if(self.options.callback) {
    			self.options.callback.call(self, file);
    		}
        });
    	return this._super.apply(this, arguments);
    },
    _save: function() {
    	this.dropzone.get(0).dropzone.processQueue();
    },
});

return DocumentDropDialog;

});