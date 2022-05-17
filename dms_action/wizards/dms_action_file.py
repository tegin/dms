# Copyright 2022 CreuBlanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class DmsActionFile(models.TransientModel):
    _name = "dms.action.file"

    dms_file_id = fields.Many2one("dms.file", required=True)
    dms_directory_id = fields.Many2one(
        "dms.directory", related="dms_file_id.directory_id"
    )
    dms_action_id = fields.Many2one("dms.action")

    def execute_action(self, action_id=False):
        if action_id:
            self.dms_action_id = action_id
        return self.dms_action_id._execute_action(self.dms_file_id)
