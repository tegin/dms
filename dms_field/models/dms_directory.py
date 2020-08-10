# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class DmsDirectory(models.Model):

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
