# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class DmsDirectory(models.Model):

    _inherit = "dms.directory"

    res_model = fields.Char()
    res_id = fields.Integer(index=True)
