odoo.define('dms_field.FileUpload', function (require) {

var core = require('web.core');
var session = require('web.session');

var utils = require('dms_field.files');
var async = require('dms_field.async');

var _t = core._t;
var QWeb = core.qweb;
	
var FileUploadMixin = {
    _uploadFile: function(file, directory) {
    	var def = $.Deferred();
    	utils.readFile(file, function (upload) {
	        this._rpc({
	            model: 'dms.file',
	            method: 'create',
	            args: [{
	                'name': file.name,
	                'directory_id': directory,
	                'content': upload.target.result.split(',')[1],
	            }],
	            context: session.user_context
	        }).then(function (result) {
	        	def.resolve(result);
	        });
    	}.bind(this));
    	return def;
    },
    _createUploadDirectory: function(name, parent_id) {
    	return this._rpc({
            model: 'dms.directory',
            method: 'create',
            args: [{
            	'name': name,
            	'parent_id': parent_id,
            }],
            context: session.user_context,
    	});
    },
    _createUploadNotification: function() {
    	return this.call('notification', 'notify', {
            title: _t('Upload Files'), 
            message: _t('Uploading...'),
            icon: 'fa-upload', 
            sticky: true,
            progress: {
            	text: "0%",
            	state: 0.0,
            },
        });
    },
    _updateUploadNotification: function(notification, progress) {
    	this.call('notification', 'progress', notification, {
        	text: (progress * 100).toFixed(2) + "%",
        	state: (progress * 100).toFixed(2),
        });
    },
    _closeUploadNotification: function(notification) {
    	this.call('notification', 'close', notification);
    },
    _uploadFiles: function(directory, tree) {
    	var progress = 0;
    	var notification = this._createUploadNotification();
    	var upload = function(parent_id, item) {
    		var def = $.Deferred();
    		if(item.isFile || item.isFileItem) {
    			this._uploadFile(item, parent_id).then(function(res) {
    				this._updateUploadNotification(notification, ++progress / tree.count);
    				def.resolve(res);
    			}.bind(this));
    		} else if(item.isDirectory) {
    			this._createUploadDirectory(item.name, parent_id).then(function(id) {
    				async.syncLoop(
    					item.files,
    					upload.bind(this, id),
    					function(res) {
    						def.resolve(id);
    					}
			    	);
    			}.bind(this));
    		}
    		return def;
	    };
	    var finish = function() {
	    	this._closeUploadNotification(notification);
	    	this.reload();
	    };
    	async.syncLoop(
    		tree.files, 
    		upload.bind(this, directory),
    		finish.bind(this),
    	);
    },
};

return FileUploadMixin;

});
