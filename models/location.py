# -*- coding: utf-8 -*-
from datetime import  datetime, timedelta, date
# import random

from odoo import models, fields, api
from colorama import Fore
import json
import io
from base64 import b64decode
from PIL import Image, ImageOps


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
    point_color = fields.Char(default='#000000')
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


    def values_locations(self, diagram_id):
        diagram = self.env['sd_visualize.diagram'].browse( diagram_id)
        values = self.env['sd_visualize.values'].search([('diagram', '=', diagram_id),('display', '=', True)])
        locations = self.search([('diagram', '=', diagram_id),('value_id', 'in', values.ids)])
        receipt = b64decode(diagram.image)
        im = Image.open(io.BytesIO(receipt))
        # print(f'-----------> \n     diagram:{diagram_id} '
        #       f'\n locations: {locations} len: {len(locations)}'
        #       f'\n w x h : {im.size} ')
        image_x, image_y = im.size

        data = [
            {
                'id': rec.value_id.id,
                'display_name': rec.value_id.display_name,
                'value': rec.value_id.value,
                'display_type': rec.value_id.display_type,
                # 'image': rec.value_id.image,
                'symbol': rec.value_id.symbol,
                'image_x': image_x,
                'image_y': image_y,
                'point_x': rec.point_x,
                'point_y': rec.point_y,
                'point_w': rec.point_w,
                'point_h': rec.point_h,
                'point_size': rec.point_size,
                'point_color': rec.point_color,
                'point_border': rec.point_border,
                'point_label_show': rec.point_label_show,
                'point_border_show': rec.point_border_show,
                'point_border_width': rec.point_border_width,
             }
         for rec in locations]
        return json.dumps(data)