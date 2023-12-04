# -*- coding: utf-8 -*-
from datetime import  datetime, timedelta, date
# import random

from odoo import models, fields, api

from colorama import Fore


class SdVisualizeLocation(models.Model):
    _name = 'sd_visualize.location'
    _description = 'sd_visualize.location'
    _order = 'diagram asc'

    diagram = fields.Many2one('sd_visualize.diagram', required=True, )
    value_id = fields.Many2one('sd_visualize.values', required=False, )
    point_x = fields.Integer(default=0 )
    point_y = fields.Integer(default=-200)
    point_w = fields.Integer(default=200 )
    point_h = fields.Integer(default=100)
    point_size = fields.Integer(default=25)
    point_color = fields.Char(default='#00000')
    point_border = fields.Char(default='#bd7295')
    point_label_show = fields.Boolean(default=True)
    point_border_show = fields.Boolean(default=True)
    point_border_width = fields.Integer(default=5)

# class SdProjectOverviewValueTypesLocation(models.Model):
#     _inherit = 'sd_visualize.values_types'
#
#     # #########################################################################
#     @api.model
#     def create(self, vals):
#         res = super(SdProjectOverviewValueTypesLocation, self).create(vals)
#         diagrams = self.env['sd_visualize.diagram'].search([('project', '=', int(vals.get('project')))])
#         for diagram in diagrams:
#             self.env['sd_visualize.location'].create({'diagram': diagram.id, 'task_id': task_id})
#
#         return res