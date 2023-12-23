# -*- coding: utf-8 -*-
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
    display_type = fields.Selection([('data', 'Data'), ('image', 'Image')], default='data')
    variable_name = fields.Char(required=True, )
    value = fields.Char(default='0' )
    image = fields.Image()
    image_url = fields.Char()
    symbol = fields.Char( )
    diagram = fields.Many2one('sd_visualize.diagram', default=lambda self: self.env.context.get('diagram'))
    equation = fields.Char()
    calculate = fields.Boolean(default=False)
    sequence = fields.Integer(default=10)
    code = fields.Text()

    def write(self, vals):
        # print(f'>>>>>>>>>>> [values  write]: {vals}')

        return super(SdVisualizeValues, self).write(vals)

    @api.model
    def create(self, vals):
        # print(f'>>>>>>  [values create]: {vals}')
        return super(SdVisualizeValues, self).create(vals)

