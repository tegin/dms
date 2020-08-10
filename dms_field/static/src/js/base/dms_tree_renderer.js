odoo.define('dms.DmsTreeRenderer', function (require) {
    "use strict";

    var BasicRenderer = require('web.BasicRenderer');
    var core = require('web.core');
    var ajax = require('web.ajax');
    var DmsTreeController = require('dms.DmsTreeController');
    var ControlPanelMixin = require('web.ControlPanelMixin');
    // var registry = require('kpi_dashboard.widget_registry');
    var Dialog = require('web.Dialog');

    var BusService = require('bus.BusService');
    var QWeb = core.qweb;
    var _t = core._t;

    var DmsTreeRenderer = BasicRenderer.extend(ControlPanelMixin, {
        xmlDependencies: [
            '/dms_field/static/src/xml/tree.xml'
        ],
        cssLibs: [
            '/dms_field/static/lib/jsTree/themes/proton/style.css',
        ],
        jsLibs: [
            '/dms_field/static/lib/jsTree/jstree.js',
        ],
        custom_events: _.extend({}, BasicRenderer.prototype.custom_events, {
            tree_ready: '_treeReady',
            tree_changed: '_treeChanged',
        }),
        template: 'dms.DocumentTree',
        init: function (parent, params) {
            this._super.apply(this, arguments);
            this.params = params || {};
            this.config = this._buildTreeConfig();
            this.storage_data = {};
            this.controller = new DmsTreeController(this, _.extend({}, params.model, {}), this, params);
            this._update_cp()
        },

        start: function () {
            return $.when(this._super.apply(this, arguments))
                .then(this._update_cp.bind(this))
                .then(this._update_view.bind(this));
        },

        willStart: function() {
            return $.when(ajax.loadLibs(this),
                this._super.apply(this, arguments)
            );
        },

        _buildTreeConfig: function() {
            var plugins = this.params.plugins || [
                "conditionalselect", "massload", "wholerow",
                "state", "sort", "search", "types", "contextmenu",
            ];
            var config = {
                core : {
                    widget: this,
                    animation: this.params.animation || 0,
                    multiple: this.params.disable_multiple ? false : true,
                    check_callback: this.params.check_callback || this._checkCallback.bind(this),
                    themes: this.params.themes || {
                        name: 'proton',
                        responsive: true
                    },
                    data: this._loadData.bind(this),
                },
                /*massload: this._massloadData.bind(this),
                contextmenu: this.params.contextmenu_items || {
                    items: this._loadContextMenu.bind(this),
                },*/
                /*search: this.params.search || {
                    ajax: this._searchData.bind(this),
                    show_only_matches: true,
                    search_callback: this._searchCallback.bind(this),
                },*/
                contextmenu: this.params.contextmenu_items || {
                    items: this._loadContextMenu.bind(this),
                },
                state : {
                    key: this.params.key || "documents"
                },
                conditionalselect: this.params.conditionalselect || this._checkSelect.bind(this),
                /*dnd: this.params.dnd_options || {
                    touch: false,
                },*/
                plugins: plugins,
            };
            return config;
        },

        _loadData: function (node, callback) {
            var self = this;
            this.controller.load(node).then(function(data) {
                callback.call(self, data);
            });
        },
        _massloadData: function (data, callback) {
            this.controller.massload(data).then(function(data) {
                callback.call(this, data);
            });
        },
        _searchData: function(val, callback) {
            var node = this.getSelectedDirectory();
            if(node) {
                this.controller.search(val, node, {
                    search: {
                        operator: this.searchTester.test(val) ? "=ilike" : "ilike",
                    }
                }).then(function(data) {
                    callback.call(this, data);
                });
            } else {
                callback.call(this, []);
            }
        },

        start_tree_triggers: function(){
            var self = this
            this.$tree.on('open_node.jstree', function (e, data) {
                if(data.node.data && data.node.data.odoo_model === "dms.directory") {
                    data.instance.set_icon(data.node, "fa fa-folder-open-o");
                }
            });
            this.$tree.on('close_node.jstree', function (e, data) {
                if(data.node.data && data.node.data.odoo_model === "dms.directory") {
                    data.instance.set_icon(data.node, "fa fa-folder-o");
                }
            });
            this.$tree.on('ready.jstree', function (e, data) {
                self.trigger_up('tree_ready', {
                    data: data
                });
            });
            this.$tree.on('changed.jstree', function (e, data) {
                self.trigger_up('tree_changed', {
                    data: data
                });
            });
            this.$tree.on('move_node.jstree', function(e, data) {
                self.trigger_up('move_node', {
                    node: data.node,
                    new_parent: data.parent,
                    old_parent: data.old_parent,
                });
            });
            this.$tree.on('copy_node.jstree', function(e, data) {
                self.trigger_up('copy_node', {
                    node: data.node,
                    original: data.original,
                    parent: data.parent,
                });

            });
            this.$tree.on('rename_node.jstree', function(e, data) {
                self.trigger_up('rename_node', {
                    node: data.node,
                    text: data.text,
                    old: data.old,
                });
            });
            this.$tree.on('delete_node.jstree', function(e, data) {
                self.trigger_up('delete_node', {
                    node: data.node,
                    parent: data.parent,
                });
            });
            this.$('[data-toggle="tooltip"]').tooltip();
        },

        _treeReady: function(ev) {
            this.show_preview();
        },

        _treeChanged: function(ev) {
            var data = ev.data.data;
            if(data.selected && data.selected.length === 1) {
                this._preview_node(data.node);
			}
        },

        show_preview: function() {
            this.$('.mk_document_col_tree').removeClass('w-100');
            this.splitter = this.$('.mk_document_row').split({
                orientation: 'vertical',
                limit: 100,
                position: '60%'
            });
            // this._set_storage('dms_documents_disable_preview', false);
        },

        start: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.$tree = this.$('.mk_tree');
            this.$tree.jstree(this.config)
            /*this._rpc({
                 model: 'dms.storage',
                 method: 'get_js_tree_data',
                 args: [[]],
                 kwargs: {
                 },
            }).then(function(data_list) {
                self.$tree.jstree({ 'core' : {
                    'data' : data_list
                } });
            });*/
            this.start_tree_triggers();
            return res;
        },
        _checkCallback: function (operation, node, parent, position, more) {
            if(operation === "copy_node" || operation === "move_node") {
                // prevent moving a root node
                if(node.parent === "#") {
                    return false;
                }
                // prevent moving a child above or below the root
                if(parent.id === "#") {
                    return false;
                }
                // prevent moving a child to a settings object
                if(parent.data && parent.data.odoo_model === "dms.settings") {
                    return false;
                }
                // prevent moving a child to a file
                if(parent.data && parent.data.odoo_model === "dms.file") {
                    return false;
                }
            }
            if(operation === "move_node") {
                // prevent duplicate names
                if(node.data && parent.data) {
                    var names = [];
                    var jstree = this.renderer.$tree.jstree(true);
                    _.each(parent.children, function(child, index, children) {
                        var child_node = jstree.get_node(child);
                        if(child_node.data && child_node.data.odoo_model === parent.data.odoo_model) {
                            names.push(child_node.data.name);
                        }
                    });
                    if(names.indexOf(node.data.name) > -1) {
                        return false;
                    }
                }
            }
            return true;
        },
        _checkSelect: function(node, event) {
            if(this.params.filesOnly && node.data.odoo_model !== "dms.file") {
                return false;
            }
            return !(node.parent === '#' && node.data.odoo_model === "dms.settings");
        },
        _preview_node: function(node) {
            var self = this;
            if(node.data && ["dms.directory", "dms.file"].indexOf(node.data.odoo_model) !== -1) {
                this.$('.mk_document_preview').html(
                    $(QWeb.render('dms.DocumentTreeViewDirectoryPreview', {
                        widget: this,
                        dms_object: node.data,
                    })));
            }
        },
        _loadContextMenu: function(node, callback) {
            var menu = {};
            var jstree = this.$tree.jstree(true);
            if(node.data) {
                if(node.data.odoo_model === "dms.directory") {
                    menu = this._loadContextMenuBasic(jstree, node, menu);
                    menu = this._loadContextMenuDirectory(jstree, node, menu);
                } else if(node.data.odoo_model === "dms.file") {
                    menu = this._loadContextMenuBasic(jstree, node, menu);
                    menu = this._loadContextMenuFile(jstree, node, menu);
                }
            }
            return menu;
        },
        _loadContextMenuBasic: function($jstree, node, menu) {
            var self = this;
            menu.rename = {
                separator_before: false,
                separator_after: false,
                icon: "fa fa-pencil",
                label: _t("Rename"),
                action: function (data) {
                    $jstree.edit(node);
                },
                _disabled: function (data) {
                    return !node.data.perm_write;
                },
            };
            menu.action = {
                separator_before: false,
                separator_after: false,
                icon: "fa fa-bolt",
                label: _t("Actions"),
                action: false,
                submenu: {
                    cut: {
                        separator_before: false,
                        separator_after: false,
                        icon: "fa fa-scissors",
                        label: _t("Cut"),
                        action: function (data) {
                            $jstree.cut(node);
                        },
                    },
                    copy: {
                        separator_before: false,
                        separator_after: false,
                        icon: "fa fa-clone",
                        label: _t("Copy"),
                        action: function (data) {
                            $jstree.copy(node);
                        },
                    },
                },
                _disabled: function (data) {
                    return !node.data.perm_read;
                },
            };
            menu.delete = {
                separator_before: false,
                separator_after: false,
                icon: "fa fa-trash-o",
                label: _t("Delete"),
                action: function (data) {
                    $jstree.delete_node(node);
                },
                _disabled: function (data) {
                    return !node.data.perm_unlink;
                },
            };
            return menu;
        },
        _loadContextMenuDirectory: function($jstree, node, menu) {
            var self = this;
            if(menu.action && menu.action.submenu) {
                menu.action.submenu.paste = {
                    separator_before: false,
                    separator_after: false,
                    icon: "fa fa-clipboard",
                    label: _t("Paste"),
                    action: function (data) {
                        $jstree.paste(node);
                    },
                    _disabled: function (data) {
                        return !$jstree.can_paste() && !node.data.perm_create;
                    },
                };
            }
            return menu;
        },
        _loadContextMenuFile: function($jstree, node, menu) {
            var self = this;
            menu.download = {
                separator_before: false,
                separator_after: false,
                icon: "fa fa-download",
                label: _t("Download"),
                action: function(data) {
                    framework.blockUI();
                    session.get_file({
                        'url': '/web/content',
                        'data': {
                            'id': node.data.odoo_id,
                            'download': true,
                            'field': 'content',
                            'model': 'dms.file',
                            'filename_field': 'name',
                            'filename': node.data.filename
                        },
                        'complete': framework.unblockUI,
                        'error': crash_manager.rpc_error.bind(crash_manager)
                    });
                }
            };
            return menu;
        },

        _update_view: function() {
            this.controller.appendTo(this.$('.mk_treeview'));
        },

        willStart: function() {
            return $.when(ajax.loadLibs(this), this._super.apply(this, arguments));
        },

        _open_selected_node: function() {
            var node = this.controller.getSelectedItem();
            if(node) {
                this.controller._openNode(node);
            }
        },

        _create_selected_node: function() {
            var node = this.controller.getSelectedItem();
            if(node) {
                var parent = node.data.odoo_model === "dms.file" ? this.controller.getParentNode(node) : node;
                this.controller._createNode(parent, node.data.odoo_model);
            }
        },
        _edit_selected_node: function() {
            var node = this.controller.getSelectedItem();
            if(node) {
                this.controller._editNode(node);
            }
        },
        _delete_selected_node: function() {
            var nodes = this.controller.getTopSelectedItems();
            if(nodes.length > 0) {
                this.controller._deleteNodes(nodes);
            }
        },
        _show_help: function() {
            var buttons = [{
                text: _t("Ok"),
                close: true,
            }];
            var dialog = new Dialog(this, {
                size: 'medium',
                buttons: buttons,
                $content: $(QWeb.render('dms.DocumentHelpDialogContent')),
                title: _t("Help"),
            });
            dialog.open();
        },
        refresh: function(message) {
            if(this._get_storage('dms_documents_auto_refresh')) {
                this.controller.refresh(message);
            }
        },
        _update_cp: function() {
            var self = this;
            console.log("Here")
            if (!this.$buttons) {
                this.$buttons = $(QWeb.render('dms.DocumentTreeViewButtons', {
                    widget: this,
                }));
                this.$buttons.find('.mk_open').on('click', _.bind(this._open_selected_node, this));
                this.$buttons.find('.mk_create').on('click', _.bind(this._create_selected_node, this));
                this.$buttons.find('.mk_edit').on('click', _.bind(this._edit_selected_node, this));
                this.$buttons.find('.mk_delete').on('click', _.bind(this._delete_selected_node, this));
            }
            console.log(this.$buttons)
            if (!this.$pager) {
                this.$pager = $(QWeb.render('dms.DocumentTreeViewActions', {
                    widget: this,
                }));
                this.$pager.find('.mk_action_help').on('click', _.bind(this._show_help, this));
                this.$pager.find('.mk_refresh').on('click', _.bind(this.refresh, this));
            }
            console.log(this.$pager)
            this.update_control_panel({
                cp_content: {
                    $buttons: this.$buttons,
                    $pager: this.$pager,
                },
            });
        },
    });

    return DmsTreeRenderer;
});
