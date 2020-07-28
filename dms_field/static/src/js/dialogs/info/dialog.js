odoo.define('dms_field.DocumentInfoDialog', function(require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var field_utils = require('web.field_utils');

var Dialog = require('web.Dialog');

var _t = core._t;
var QWeb = core.qweb;

var DocumentInfoDialog = Dialog.extend({
	init: function (parent, options) {
    	this.options = options || {};
        this._super(parent, _.extend({}, {
            size: "medium",
        }, this.options));
    },
    willStart: function() {
    	var self = this;
    	var load = this._rpc({
            fields: _.union(['__last_update'], this.options.fields),
            domain: [['id', '=', this.options.id]],
            model: this.options.model,
            method: 'search_read',
            context: this.options.context || session.user_context,
        }).then(function(records) {
        	self.record = records[0];
        	if(self.record.size) {
        		self.record.size = field_utils.format.binary_size(self.record.size);
        	}
        	if(self.record.write_uid) {
        		self.record.write_uid = self.record.write_uid[1];
        	}
        	var unique = self.record.__last_update.replace(/[^0-9]/g, '');
        	self.record.thumbnail_link = session.url('/web/image', {
        		model: self.options.model,
        		field: 'thumbnail_medium', 
        		id: self.record.id, 
        		unique: unique
        	});
        	self.$content = $(QWeb.render(self.options.qweb, {
        		widget: self,
        		record: self.record,
			}));
        });
        return $.when(this._super.apply(this, arguments), load);
    },
});

return DocumentInfoDialog;

});