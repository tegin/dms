odoo.define('dms.DmsTreeView', function (require) {
    "use strict";

    var BasicView = require('web.BasicView');

    var DmsTreeController = require('dms.DmsTreeController');
    // var AbstractModel = require('web.AbstractModel');
    var DmsTreeRenderer = require('dms.DmsTreeRenderer');
    var view_registry = require('web.view_registry');
    var core = require('web.core');
    var QWeb = core.qweb;
    var _lt = core._lt;

    var DmsTreeView = BasicView.extend({
        cssLibs: [
            '/dms_field/static/lib/jsTree/themes/proton/style.css',
            '/dms_field/static/lib/jquery-splitter/css/jquery.splitter.css',

        ],
        jsLibs: [
            '/dms_field/static/lib/jsTree/jstree.js',
            '/dms_field/static/lib/jquery-splitter/js/jquery.splitter.js',
        ],
        display_name: _lt("DMS"),
        icon: 'fa-tachometer',
        template: 'dms.DocumentTree',
        viewType: 'dms_tree',
        config: _.extend({}, BasicView.prototype.config, {
            Controller: DmsTreeController,
            Renderer: DmsTreeRenderer,
            // Model: AbstractModel,
        }),
        multi_record: true,
        searchable: false,


    });

    view_registry.add('dms_tree', DmsTreeView);

    return DmsTreeView;
});
