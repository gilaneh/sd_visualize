# -*- coding: utf-8 -*-
{
    'name': "sd_visualize",

    'summary': """
        """,

    'description': """
        
    """,

    'author': "Arash Homayounfar",
    'website': "https://gilaneh.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/14.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Service Desk/Service Desk',
    'application': True,
    'version': '1.1.3.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web', 'mail','project', ],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/diagram.xml',
        'views/location.xml',
        'views/values.xml',
        # 'wizard/diagram_date_wizard.xml',
    ],
    'assets': {
        # 'website.assets_editor': [
        #     'static/src/**/*',
        # ],
        'web.assets_qweb': [
            'sd_visualize/static/src/components/**/*.xml',
        ],
        'web.assets_frontend': [
            'sd_visualize/static/src/css/style.scss',
            'sd_visualize/static/src/js/diagram_frontend.js'
        ],
        'web.assets_backend': [
            'sd_visualize/static/src/css/style.scss',
            # 'sd_visualize/static/src/lib/plotlyjs_2.27.1/plotly.min.js',
            # 'sd_visualize/static/src/css/styles.css',
            'sd_visualize/static/src/js/plot.js',
            'sd_visualize/static/src/js/show_plots.js',
            'sd_visualize/static/src/lib/interactjs/interact.min.js',
            'sd_visualize/static/src/js/visualize_diagram_process.js',
            'sd_visualize/static/src/components/**/*.js',
            'sd_visualize/static/src/components/**/*.scss',

        ],
        'web.report_assets_common': [
            'sd_visualize/static/src/css/report_styles.css',
            # 'sd_visualize/static/src/js/website_form_sd_visualize.js'
        ],

    },

    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'license': 'LGPL-3',

}
