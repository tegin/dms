odoo.define("dms_media_dialog.widgets.media", function(require) {
    "use strict";
    var concurrency = require("web.concurrency");
    var dialogs = require("web.view_dialogs");
    var rpc = require("web.rpc");
    var widgets_media = require("wysiwyg.widgets.media");
    var MediaWidget = widgets_media.MediaWidget;

    var DmsWidget = MediaWidget.extend({
        template: "wysiwyg.widgets.dms",
        events: _.extend({}, MediaWidget.prototype.events || {}, {
            "click .o_search_dms_field_pop_up": "_onButtonSearchDmsClick",
        }),
        VIDEO_MIMETYPES: ["video/mp4", "video/webm", "video/ogg"],
        IMAGE_MIMETYPES: [
            "image/gif",
            "image/jpe",
            "image/jpeg",
            "image/jpg",
            "image/gif",
            "image/png",
            "image/svg+xml",
        ],

        init: function(parent, media, options) {
            this._super(parent, media, options);
            this._mutex = new concurrency.Mutex();
            this.options = options;
        },
        _onButtonSearchDmsClick: function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var self = this;
            return new dialogs.SelectCreateDialog(
                self,
                _.extend({}, self.nodeOptions, {
                    res_model: "dms.file",
                    title: "Select a DMS file",
                    initial_view: "search",
                    disable_multiple_selection: true,
                    no_create: true,
                    on_selected: function(record) {
                        self._selectDmsFile(record);
                    },
                })
            ).open();
        },

        _selectDmsFile: function(record) {
            var self = this;
            var dms_file_id = record[0].id;
            rpc.query({
                model: "dms.file",
                method: "read",
                args: [
                    [dms_file_id],
                    ["name", "content", "access_url", "res_mimetype", "access_token"],
                ],
            }).then(function(file) {
                return self._mutex.exec(self._addData.bind(self, file));
            });
        },

        async _addData(file) {
            if (!file.length) {
                // Case if the input is emptied, return resolved promise
                return;
            }
            var self = this;
            var uploadMutex = new concurrency.Mutex();
            uploadMutex.exec(function() {
                self.dms_file = file;
                self.trigger_up("save_request");
            });
        },

        save: function() {
            if (this.dms_file) {
                return Promise.resolve(this._save_dms_file());
            }
            return;
        },

        _save_dms_file: function() {
            var dms_file = this.dms_file[0];
            var src = dms_file.access_url;
            if (dms_file.access_token) {
                src += _.str.sprintf("?access_token=%s", dms_file.access_token);
            }
            if (this.VIDEO_MIMETYPES.includes(dms_file.res_mimetype)) {
                this._save_video(src);
            } else if (this.IMAGE_MIMETYPES.includes(dms_file.res_mimetype)) {
                this._save_image(src);
            } else {
                this._save_document(src);
            }
            return this.media;
        },

        _save_video: function(url) {
            this.$media = $(
                '<div class="media_iframe_video">' +
                    '<div class="css_editable_mode_display">&nbsp;</div>' +
                    '<video autoplay controls><source src="' +
                    url +
                    '" /></video>' +
                    "</div>"
            );
            this.media = this.$media[0];
        },

        _save_image: function(url) {
            if (!this.$media.is("img")) {
                // Note: by default the images receive the bootstrap opt-in
                // img-fluid class. We cannot make them all responsive
                // by design because of libraries and client databases img.
                this.$media = $("<img/>", {class: "img-fluid o_we_custom_image"});
                this.media = this.$media[0];
            }
            this.$media.attr("src", url);
        },

        _save_document: function(url) {
            if (!this.$media.is("a")) {
                $(".note-control-selection").hide();
                this.$media = $("<a/>");
                this.media = this.$media[0];
            }
            this.$media.attr("href", url);
            // The class o_image has been fully copied into o_dms_mimetype in order to avoid problems at the start method of the FileWidget
            // When the method searched for a match with 'web/content' in href, it returned null and triggered an error.
            this.$media
                .addClass("o_dms_mimetype")
                .attr("title", this.dms_file[0].name)
                .attr("data-mimetype", this.dms_file[0].res_mimetype);
        },
    });

    widgets_media.DmsWidget = DmsWidget;
    return widgets_media;
});
