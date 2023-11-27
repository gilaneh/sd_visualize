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
    variable_name = fields.Char(required=True, )
    value = fields.Char(default='0' )
    diagram = fields.Many2one('sd_visualize.diagram', default=lambda self: self.env.context.get('diagram'))
    equation = fields.Char()


