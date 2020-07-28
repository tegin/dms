import logging

from odoo import _, http
from odoo.http import request

_logger = logging.getLogger(__name__)


class BackendController(http.Controller):

    @http.route('/dms/view/tree/create/directory', type='json', auth="user")
    def create_directory(self, parent_id, name=None, context=None, **kw):
        parent = request.env['dms.directory'].sudo().browse(parent_id)
        # uname = file.unique_name(name or _("New Directory"), parent.child_directories.mapped('name'))
        uname = "hola"
        directory = request.env['dms.directory'].with_context(context or request.env.context).create({
            'name': uname,
            'parent_id': parent_id
        })
        return {
            'id': "directory_%s" % directory.id,
            'text': directory.name,
            'icon': "fa fa-folder-o",
            'type': "directory",
            'data': {
                'odoo_id': directory.id,
                'odoo_model': "dms.directory",
                'odoo_record': {},
                'name': directory.name,
                'perm_read': directory.permission_read,
                'perm_create': directory.permission_create,
                'perm_write': directory.permission_write,
                'perm_unlink': directory.permission_unlink,
                'parent': "directory_%s" % parent_id,
            },
            'children': False,
        }    