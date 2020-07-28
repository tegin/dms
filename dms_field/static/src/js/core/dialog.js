odoo.define('dms_field.Dialog', function (require) {
"use strict";

var core = require('web.core');

var Dialog = require('web.Dialog');

var QWeb = core.qweb;
var _t = core._t;

Dialog.input = function (owner, title, options) {
	var $content = $('<main/>');
	var $input = $('<input/>', {
	    type: 'text',
	    class: options && options.input && options.input.class,
	    value: options && options.input && options.input.value,
	});
	$content.append($input);
	var confirm = function(event) {
		if(options && options.confirm_callback) {
			options.confirm_callback.call(self, event, $input.val());
		}
	}
	var buttons = [
        {
            text: _t("Save"),
            classes: 'btn-primary',
            close: true,
            click: confirm,
        },
        {
            text: _t("Cancel"),
            close: true,
            click: options && options.cancel_callback
        }
    ];
    return new Dialog(owner, _.extend({
        size: 'medium',
        buttons: buttons,
        $content: $content,
        title: title,
    }, options)).open({shouldFocusButtons:true});
};


});
