# Copyright 2020 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class DmsFile(models.Model):

    _inherit = "dms.file"

    def _get_file_data(self):
        return {
            "id": self.id,
            "mimetype": self.mimetype,
            "extension": self.extension,
            "name": self.name,
            "thumbnail": self.thumbnail,
        }
