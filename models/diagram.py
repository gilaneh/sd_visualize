# -*- coding: utf-8 -*-
from datetime import  datetime, timedelta, date
# import random

from odoo import models, fields, api

from colorama import Fore
import json
import logging
import base64
from PIL import Image
import io
class SdVisualizeDiagram(models.Model):
    _name = 'sd_visualize.diagram'
    _description = 'sd_visualize.diagram'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    # _order = 'sequence,id asc'

    name = fields.Char(required=True, )
    project = fields.Many2one('project.project', )
    values = fields.Many2many('sd_visualize.values', required=False, )
    image = fields.Image(required=True, )
    last_date = fields.Date(default=lambda self: date.today())
    first_date = fields.Date(default=lambda self: date.today() - timedelta(days=30))
    update = fields.Boolean(default=False, compute='update_compute')
    calculator = fields.Many2one('ir.model', )
    # cal_function = fields.Many2one('sd_vcalculate.data', )

    @api.depends('name')
    def update_compute(self):
        for rec in self:
            rec.update = True if rec.update == False else False
        self._calculator()
        # print(f'---------------\n {dir(self)}\n')

    def _calculator(self):
        # todo: it needed a wizard to take dates
        petronad = self.env['sd_vcalculate_petronad.data'].calculate(self, date.today() - timedelta(days=30), date.today())
        print(f'RRRRRRR> \n calculator: {self.calculator} petronad: {petronad}')

    @api.model
    def create(self, vals):
        res = super(SdVisualizeDiagram, self).create(vals)
        values_model = self.env['sd_visualize.values']
        location_module = self.env['sd_visualize.location']
        value_ids = vals.get('values')[0][2] if vals.get('values', False) else []
        values = values_model.browse(value_ids)
        # print(f'dddddddddddddd\n values: {values}')
        for value in values:
            location_module.create({'diagram': res.id, 'value_id': value.id})
        return res

    # #########################################################################
    def write(self, vals):
        res = super(SdVisualizeDiagram, self).write(vals)
        print(f'\n write vals: {vals}')
        if vals.get("values", False):
            location_module = self.env['sd_visualize.location']
            locations = location_module.search([('diagram', '=', self._origin.id)])
            location_ids = locations.ids
            locations_values = dict([(loc.value_id.id, loc.id) for loc in locations])

            value_ids = vals.get("values", [[0, 0, []]])[0][2]
            add_ids = set(value_ids).difference(set(locations_values.keys()))
            del_ids = set(locations_values.keys()).difference(set(value_ids))
            #
            print(f'----.-.-.-.-.-.\n diagram: \n{vals.get("values")} \ndel_ids: {del_ids} \nadd_ids: {add_ids}')
            del_loc_ids = list(map(lambda x: x[1] if x[0] in del_ids else False, locations_values.items()))
            for location in location_module.browse(del_loc_ids):
                location.unlink()
            for value in add_ids:
                location_module.create({'diagram': self._origin.id, 'value_id': value})

        return res


    # #########################################################################
    def set_diagram_locations(self, pointer):
    # def set_diagram_locations(self, pointer, point_x=[], point_y=[], point_w=[], point_h=[], point_size=[], point_color=[]):
        location_model = self.env['sd_visualize.location']
        # print(f'!!!!!!!!!!!!!!!!!!!!!\n{pointer}')
        # print('!!!!!!!!!!!!!!!!!!!!!\n')
        # for loc_id, value in pointer.items():
            # print(f'pointer\n{loc_id}\n{value}')
        # print(f'\n set_diagram_locations {self} \n point_x: {point_x} \n point_y: {point_y} \n point_w: {point_w} \n point_h: {point_h} \n point_size: {point_size} \n point_color: {point_color}')
        # point_x: {'data_box_16': 300, 'data_box_14': 200}
        # point_y: {'data_box_16': -400, 'data_box_14': -100}
        # point_x = dict(point_x)
        # point_y = dict(point_y)
        # point_size = dict(point_size)
        for loc_id, values in pointer.items():
        #     # todo: int(key.replace('data_box_', '')) is value id not the value_type id!!!
        #     print(f'\n key.find("data_box_"): \n{key.find("data_box_")} \n key.replace("data_box_", "").isdigit(): {key.replace("data_box_", "").isdigit()}')
        #     if not key.replace('data_box_', '').isdigit():
        #         continue
            try:
                # location_id = int(key.replace('data_box_', ''))
                location_model.browse(loc_id).write({'point_x': values.get('point_x', 100),
                                                     'point_y': values.get('point_y', -200),
                                                     'point_w': values.get('point_w', 100),
                                                     'point_h': values.get('point_h', 100),
                                                     'point_size': values.get('point_size', 20),
                                                     'point_color': values.get('point_color', 8),
                                                     'point_border': values.get('point_border', 8),
                                                     'point_label_show': values.get('point_label_show', True),
                                                     'point_border_show': values.get('point_border_show', True),
                                                     'point_border_width': values.get('point_border_width', 8),
                                                     })
            except Exception as e:
                logging.error(f'ERROR: {e}')

        return json.dumps('set_diagram_locations')

    # #########################################################################
    def get_diagram_values(self, diagram_id=0):
        if diagram_id:
            diagram_id = diagram_id
        else:
            diagram_id = self._origin.id

        diagram = self.browse(diagram_id)
        if len(diagram) != 1:
            return json.dumps([{'data': '', }])

        if diagram.image[-2:] != '==':
            padded_data = diagram.image + b'=='
        else:
            padded_data = diagram.image
        image_file = base64.b64decode(padded_data)
        im = Image.open(io.BytesIO(image_file))
        w, h = im.size

        locations = self.env['sd_visualize.location'].search([('diagram', '=', diagram_id)])
        # print(f'>>>>>>>>>>>>>>>>> diagram_id: {diagram_id} \n locations: {locations}\n {w}, {h}')
        locations_list = list([{'id': lo.id,
                                'value': lo.value_id,
                                'point_x': lo.point_x,
                                'point_y': lo.point_y,
                                'point_w': lo.point_w,
                                'point_h': lo.point_h,
                                'point_size': lo.point_size,
                                'point_color': lo.point_color,
                                'point_border': lo.point_border,
                                'point_label_show': lo.point_label_show,
                                'point_border_show': lo.point_border_show,
                                'point_border_width': lo.point_border_width,
                                'diagram': lo.diagram
                                } for lo in locations])
        # print(f'\n locations_list: \n{locations_list}')

        data = [{
            'id': diagram_id,
            'image_size': (w, h),
            'values': list([{'loc_id': location.get('id'),
                             'diagram_id': location.get('diagram').id,
                             'name': location.get('value').display_name,
                             'value': location.get('value').value,
                             # 'actual': location.get('value').progress_actual,
                             'point_x': location.get('point_x'),
                             'point_y': location.get('point_y'),
                             'point_w': location.get('point_w'),
                             'point_h': location.get('point_h'),
                             'point_size': location.get('point_size'),
                             'point_color': location.get('point_color'),
                             'point_border': location.get('point_border'),
                             'point_label_show': location.get('point_label_show'),
                             'point_border_show': location.get('point_border_show'),
                             'point_border_width': location.get('point_border_width'),
                             } for location in locations_list])
        }]

        return json.dumps([{'data': data, }])

