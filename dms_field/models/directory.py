import logging

from odoo import _, models, api, fields

_logger = logging.getLogger(__name__)


class Directory(models.Model):
    
    _inherit = 'dms.directory'

    @api.model
    def _build_documents_view_directory(self, directory):
        return {
            "id": "directory_%s" % directory.id,
            "text": directory.name,
            "icon": "fa fa-folder-o",
            "type": "directory",
            "data": {
                "odoo_id": directory.id,
                "odoo_model": "dms.directory",
            },
            "children": directory.count_elements > 0,
        }
        
    @api.multi
    def _build_documents_view_initial(self):
        if len(self) == 1:
            return [self._build_documents_view_directory(self)]
        else:
            initial_data = []
            subdirectories = self.env['dms.directory']
            for record in self.with_context(prefetch_fields=False):
                subdirectories |= (record.search([
                    ('parent_id', 'child_of', record.id)
                ]) - record)
            for record in self - subdirectories:
                initial_data.append(
                    record._build_documents_view_directory(record)
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
                "key": "dms_documents_directory_%s" % "-".join(map(str, self.ids)),
            },
            "name": self.display_name if len(self) == 1 else _("Documents"),
        }
