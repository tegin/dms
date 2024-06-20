# Copyright 2024 CreuBlanca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class DmsDirectoryTemplate(models.Model):

    _name = "dms.directory.template"
    _description = "Dms Directory Template"
    _parent_store = True
    _order = "complete_name_for_sort"

    name = fields.Char(string="Name", required=True)
    parent_id = fields.Many2one(
        "dms.directory.template",
        index=True,
        string="Parent Directory",
        ondelete="cascade",
    )
    parent_path = fields.Char(index=True)
    child_ids = fields.One2many(
        "dms.directory.template", "parent_id", string="Subdirectories"
    )

    storage_id = fields.Many2one("dms.storage", string="Storage")

    complete_name = fields.Char(
        "Complete Name", compute="_compute_complete_name", recursive=True
    )

    complete_name_for_sort = fields.Char(
        "Complete Name for Sort", compute="_compute_complete_name_for_sort", store=True
    )

    @api.depends("name", "parent_id.complete_name")
    def _compute_complete_name(self):
        """Forms complete name of location from parent location to child location."""
        for record in self:
            if record.parent_id:
                record.complete_name = (
                    f"{record.parent_id.complete_name} / {record.name}"
                )
            else:
                record.complete_name = record.name

    @api.depends("complete_name")
    def _compute_complete_name_for_sort(self):
        """Copy complete_name for sorting."""
        for record in self:
            record.complete_name_for_sort = record.complete_name

    def name_get(self):
        result = []
        for record in self:
            name = record.complete_name or record.name
            result.append((record.id, name))
        return result
