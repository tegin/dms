# Copyright 2020 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class DmsAddDirectory(models.TransientModel):
    _name = "dms.add.directory.record"
    _description = "Add Directory to a DMS Record"

    res_id = fields.Integer()
    res_model = fields.Char()
    storage_ids = fields.Many2many(
        "dms.storage", store=False, string="Possible storages"
    )
    storage_id = fields.Many2one("dms.storage", required=True)

    with_default_dms_structure = fields.Boolean(default=True, string="Use template")

    def create_directory(self):
        """Create directories based on the DMS structure setting."""
        self.ensure_one()
        if self.with_default_dms_structure:
            return self._create_directories_with_template()
        else:
            return self._create_root_directory().ids

    def _create_directories_with_template(self):
        """Create directories using the default DMS structure template."""
        template_directories = self.env["dms.directory.template"].search(
            [("storage_id", "=", self.storage_id.id), ("parent_id", "=", False)]
        )
        root_directory = self._create_root_directory()

        if template_directories:
            return [
                self._create_directory_hierarchy(dir_template, root_directory.id).id
                for dir_template in template_directories
            ]
        else:
            return [root_directory.id]

    def _create_root_directory(self):
        """Create root directory."""
        return self.env["dms.directory"].create(
            self._prepare_directory_vals(is_root=True)
        )

    def _prepare_directory_vals(self, is_root=False, parent_id=None, name=None):
        """Prepare values for creating a directory."""
        record = self.env[self.res_model].browse(self.res_id)
        vals = {
            "storage_id": self.storage_id.id,
            "is_root_directory": is_root,
            "parent_id": parent_id,
            "name": name or record.display_name,
            "group_ids": [(4, self.storage_id.field_default_group_id.id)],
        }
        if is_root:
            vals.update(
                {
                    "res_id": self.res_id,
                    "res_model": self.res_model,
                }
            )
        return vals

    def _create_directory_hierarchy(self, template_dir, parent_id):
        """Create a directory along with its child directories based on a template."""
        parent_vals = self._prepare_directory_vals(
            is_root=False, parent_id=parent_id, name=template_dir.name
        )
        new_directory = self.env["dms.directory"].create(parent_vals)
        child_templates = self.env["dms.directory.template"].search(
            [("parent_id", "=", template_dir.id)]
        )

        for child_template in child_templates:
            self._create_directory_hierarchy(child_template, new_directory.id)

        return new_directory
