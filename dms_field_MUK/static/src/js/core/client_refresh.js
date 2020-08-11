odoo.define('dms_field_muk.client_refresh.channel', function (require) {
"use strict";

var config = require('web.config');	
var session = require('web.session');		

var WebClient = require('web.WebClient');
var BusService = require('bus.BusService');

WebClient.include({
    refresh: function(message) {
    	var action = this.action_manager.getCurrentAction();
    	var controller = this.action_manager.getCurrentController();
    	if (!this.call('bus_service', 'isMasterTab') || session.uid !== message.uid && 
    			(message.model === 'dms.directory' || message.model === 'dms.file'),
    			action && controller && controller.widget && action.tag === "muk_dms_view.documents") {
    		controller.widget.reload(message);
        } else {
        	this._super.apply(this, arguments);
        }
    },
});

});
