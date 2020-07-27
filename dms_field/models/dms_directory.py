# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class DmsDirectory(models.Model):
    _inherit = "dms.directory"

    res_model = fields.Char()
    res_id = fields.Integer(index=True)

    def _get_child_directory_data(self):
        return [child._get_directory_data() for child in self.child_directory_ids]

    def _get_directory_data(self):
        return {
            "id": self.id,
            "name": self.name,
            "thumbnail": self.thumbnail,
            "childs": self._get_child_directory_data(),
            "files": [file._get_file_data() for file in self.file_ids],
        }
