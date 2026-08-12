# -*- coding: utf-8 -*-
"""
    paste.handler
    ~~~~~~~~~~~~~

    handlers to mangle paste content.

    :copyright: Copyright (C) 2015 by the respective authors; see AUTHORS.
    :license: GPLv3, see LICENSE for details.
"""

from flask import render_template
from werkzeug.routing import BaseConverter

from pb.util import rst, markdown, style_args
from pb.responses import BaseResponse, StatusResponse

from mimetypes import add_type

add_type('text/x-markdown', '.md')
add_type('text/x-rst', '.rst')

mimetypes = {
    'text/x-markdown': markdown,
    'text/x-rst': rst
}

def render(content, mimetype, partial=False, **kwargs):
    renderer = mimetypes.get(mimetype, rst)
    content = renderer(content)
    if not partial:
        content = render_template("generic.html", cc='container-fluid', content=content, **style_args())
    return content

handlers = {
    'r': render,
}

def get(handler, content, mimetype, **kwargs):
    h = handlers.get(handler)
    if not h:
        return StatusResponse({"invalid handler": handler}, 400)
    return BaseResponse(h(content, mimetype, **kwargs), headers={
        "Content-Security-Policy": "; ".join([
            "default-src 'none'",
            "style-src 'self' 'unsafe-inline'",
            "base-uri 'none'",
            "form-action 'none'",
            "frame-ancestors 'none'",
        ]),
    })

# dirtyhack
class HandlerConverter(BaseConverter):
    regex = '[{}]'.format(''.join(handlers))
    weight = 50
