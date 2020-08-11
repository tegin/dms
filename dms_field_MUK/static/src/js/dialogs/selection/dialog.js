odoo.define('dms_field_muk.DocumentSelectionDialog', function(require) {
"use strict";

var core = require('web.core');

var Dialog = require('web.Dialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentSelectionDialog = Dialog.extend({
    init: function (parent, options) {
    	var self = this;
    	this.options = options || {};
        var buttons = [
            {
            	text: _t("Select"),
            	classes: "btn-primary",
            	close: true, 
            	click: function () {
            		if(self.view) {
            			if(self.options.view.options.disable_multiple) {
            				self.on_selected(self.view.controller.getSelectedItem());
            			} else {
            				self.on_selected(self.view.controller.getSelectedItems());
            			}
            		}
            	}
            },
            {
            	text: _t("Close"),
            	close: true
            },
        ];
        this._super(parent, _.extend({}, {
            buttons: buttons,
        }, this.options));
        this.on_selected = this.options.on_selected || (function () {});
        if(this.options.view) {
        	var dialog_view = this.options.view;
        	this.view = new dialog_view.view(this, dialog_view.options);
        }
    },
    renderElement: function() {
        this._super();
        if(this.view) {
        	this.view.appendTo(this.$el);
        }
	},
});

return DocumentSelectionDialog;

});