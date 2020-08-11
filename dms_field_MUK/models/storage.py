import logging

from odoo import _, models, api, fields

_logger = logging.getLogger(__name__)


class Storage(models.Model):
    
    _inherit = 'dms.storage'
    
    @api.model
    def _build_documents_view_storage(self, storage):
        storage_directories = []
        model = self.env['dms.directory']
        directories = model.search_parents([
            ['storage_id', '=', storage.id]
        ])
        for record in directories:
            storage_directories.append(
                model._build_documents_view_directory(record)
            )
        return {
            "id": "storage_%s" % storage.id,
            "text": storage.name,
            "icon": "fa fa-database",
            "type": "storage",
            "data": {
                "odoo_id": storage.id,
                "odoo_model": "dms.storage",
            },
            "children": storage_directories,
        }
    
    @api.multi
    def _build_documents_view_initial(self):
            initial_data = []
            for record in self:
                initial_data.append(
                    record._build_documents_view_storage(record)
                )
            return initial_data
    
    @api.multi
    def action_open_documents_view(self):
        return {
            "type": "ir.actions.client",
            "tag": "muk_dms_view.documents",
            "params": {
                "model": {
                    "initial": self._build_documents_view_initial(),
                },
                "key": "dms_documents_storage_%s" % "-".join(map(str, self.ids)),
            },
            "name": self.display_name if len(self) == 1 else _("Documents"),
        }
