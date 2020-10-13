# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import api, models


class IrAttachment(models.Model):

    _inherit = "ir.attachment"

    def _get_dms_directories(self, res_model, res_id):
        return self.env["dms.directory"].search(
            [("res_model", "=", res_model), ("res_id", "=", res_id)]
        )

    @api.model
    def create(self, vals):
        if "dms_file" in vals and vals["dms_file"]:
            del vals["dms_file"]
            return super(IrAttachment, self).create(vals)
        else:
            attachment_id = super(IrAttachment, self).create(vals)
            if attachment_id.res_model and attachment_id.res_id:
                directory_ids = self._get_dms_directories(
                    attachment_id.res_model, attachment_id.res_id
                )
                if not directory_ids:
                    directory_ids = self._get_dms_directories(
                        attachment_id.res_model, False
                    )
                    if directory_ids:
                        for directory_id in directory_ids:
                            model_item = (
                                self.env[attachment_id.res_model]
                                .sudo()
                                .browse(attachment_id.res_id)
                            )
                            self.env["dms.directory"].create(
                                {
                                    "name": model_item.display_name,
                                    "res_model": attachment_id.res_model,
                                    "res_id": attachment_id.res_id,
                                    "parent_id": directory_id.id,
                                    "storage_id": directory_id.storage_id.id,
                                }
                            )
                # create dms_file in directories
                directory_ids = self._get_dms_directories(
                    attachment_id.res_model, attachment_id.res_id
                )
                for directory_id in directory_ids:
                    self.env["dms.file"].create(
                        {
                            "name": attachment_id.name,
                            "directory_id": directory_id.id,
                            "attachment_id": attachment_id.id,
                            "res_model": attachment_id.res_model,
                            "res_id": attachment_id.res_id,
                        }
                    )
            return attachment_id
