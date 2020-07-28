{
    "name": "DMS Field",
    "summary": """DMS Field""",
    "version": '12.0.1.0.0',
    "category": 'Document Management',   
    "license": "LGPL-3",
    "website": "http://www.mukit.at",
    'live_test_url': 'https://mukit.at/r/SgN',
    "author": "MuK IT",
    "contributors": [
        "Mathias Markl <mathias.markl@mukit.at>",
    ],
    "depends": [
        "dms",
    ],
    "data": [
        "template/assets.xml",
        # "views/storage.xml",
        # "views/directory.xml",
        "views/documents.xml",
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    "images": [
        'static/description/banner.png'
    ],
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "application": False,
    "installable": True,
}