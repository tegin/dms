odoo.define('dms_field.field_utils', function(require) {
"use strict";

var core = require('web.core');
var session = require('web.session');
var utils = require('web.field_utils');

var _t = core._t;
var QWeb = core.qweb;

function formatBinarySize(value, field, options) {
	options = _.defaults(options || {}, {
    	si: true,
    });
	var thresh = options.si ? 1000 : 1024;
    if(Math.abs(value) < thresh) {
        return utils.format['float'](value, field, options) + ' B';
    }
    var units = options.si
        ? ['KB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var unit = -1;
    do {
        value /= thresh;
        ++unit;
    } while(Math.abs(value) >= thresh && unit < units.length - 1);
    return utils.format['float'](value, field, options) + ' ' + units[unit];
}

utils.format.binary_size = formatBinarySize;

});
