odoo.define("dms_media_dialog.widgets.MediaDialog", function(require) {
    "use strict";
    var widgets = require("wysiwyg.widgets");
    var MediaModules = require("wysiwyg.widgets.media");
    var media_dialog = widgets.MediaDialog;
    var session = require("web.session");
    media_dialog.include({
        events: _.extend({}, media_dialog.prototype.events, {
            "click #editor-media-dms-tab": "_onClickDmsTab",
        }),

        init: function(parent, options, media) {
            this._super.apply(this, arguments);
            var self = this;
            session.user_has_group("dms.group_dms_user").then(function(has_group) {
                if (!has_group) {
                    self.options.noDms = true;
                }
            });
            if (!options.noDms) {
                this.dmsWidget = new MediaModules.DmsWidget(this, media, options);
            }
            if (!this.activeWidget && this.dmsWidget) {
                this.activeWidget = this.dmsWidget;
            }
            this.initiallyActiveWidget = this.activeWidget;
        },

        start: function() {
            var promises = [this._super.apply(this, arguments)];
            if (this.dmsWidget) {
                promises.push(this.dmsWidget.appendTo(this.$("#editor-media-dms")));
            }
            return Promise.all(promises);
        },

        /**
         * Returns whether the dms widget is currently active.
         *
         * @returns {Boolean}
         */
        isDmsActive: function() {
            return this.activeWidget === this.dmsWidget;
        },

        // This method is overwritten in order to add the dmsWidget option.
        _clearWidgets: function() {
            [
                this.imageWidget,
                this.documentWidget,
                this.iconWidget,
                this.videoWidget,
                this.dmsWidget,
            ].forEach(widget => {
                if (widget !== this.activeWidget) {
                    widget && widget.clear();
                }
            });
        },

        _onClickDmsTab: function() {
            this.activeWidget = this.dmsWidget;
        },
    });
    return media_dialog;
});
