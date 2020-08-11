

import base64
import logging

import werkzeug.utils
import werkzeug.wrappers

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError

_logger = logging.getLogger(__name__)

class DocumentController(http.Controller):

    @http.route('/dms/replace/file/<int:id>', type='http', auth="user")
    def replace(self, id, file, content_only=False, **kw):
        record = request.env['dms.file'].browse([id])
        content = base64.b64encode(file.read())
        if file.filename == record.name or content_only:
            record.write({'content': content})
        else:
             record.write({
                'name': file.filename,
                'content': content})
        return werkzeug.wrappers.Response(status=200)
             
    @http.route('/dms/upload/file/<int:id>', type='http', auth="user")
    def upload(self, id, file, **kw):
        record = request.env['dms.directory'].browse([id])
        content = base64.b64encode(file.read())
        request.env['dms.file'].create({
            'name': file.filename,
            'directory_id': record.id,
            'content': content})
        return werkzeug.wrappers.Response(status=200)
