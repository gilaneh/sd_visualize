# -*- coding: utf-8 -*-
import json
from datetime import  datetime, timedelta, date
# import random

from odoo import models, fields, api

from colorama import Fore


class SdVisualizeValues(models.Model):
    _name = 'sd_visualize.values'
    _description = 'sd_visualize.values'
    _order = 'diagram asc'
    _rec_name = 'display_name'

    display_name = fields.Char(required=True, )
    display_type = fields.Selection([('data', 'Data'),
                                     ('box', 'Box'),
                                     ('image', 'Image'),
                                     ('chart', 'Chart'),
                                     ], default='data', required=True)
    variable_name = fields.Char(required=True, )
    value = fields.Text(default='0' )
    image = fields.Image()
    image_url = fields.Char()
    symbol = fields.Char( )
    diagram = fields.Many2one('sd_visualize.diagram', default=lambda self: self.env.context.get('diagram'))
    equation = fields.Char()
    display = fields.Boolean(default=True)
    calculate = fields.Boolean(default=False)
    sequence = fields.Integer(default=10)
    code = fields.Text()

    def write(self, vals):
        # print(f'>>>>>>>>>>> [values  write]: {vals}')

        return super(SdVisualizeValues, self).write(vals)

    @api.model
    def create(self, vals):
        res = super(SdVisualizeValues, self).create(vals)
        location_module = self.env['sd_visualize.location']
        loc = location_module.create({'diagram': vals.get('diagram'), 'value_id': res.id})

        print(f'>>>>>>  [values create]:\n {vals} \n '
              f'res.id: {res.id} loc: {loc}\n'
              )
        return res



