# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class DmsDirectoryRecord(models.AbstractModel):

    _name = "dms.directory.record"
    _description = "Dms Directory Record"
    # Default storage name
    _storage = False

    directory_id = fields.Many2one("dms.directory", readonly=True,)

    def _generate_dms_directory_vals(self):
        storage = self.env.context.get("dms_storage_id", False)
        if not storage and self._storage:
            storage = self.env.ref(self._storage).id
        vals = {"name": self.display_name}
        if storage:
            vals.update(
                {
                    "root_storage_id": storage,
                    "is_root_directory": True,
                    "res_model": self._name,
                    "res_id": self.id,
                }
            )
        return vals

    def generate_dms_directory(self):
        for record in self:
            if record.directory_id:
                continue
            record.directory_id = self.env["dms.directory"].create(
                record._generate_dms_directory_vals()
            )
