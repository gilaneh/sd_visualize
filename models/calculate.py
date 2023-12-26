# -*- coding: utf-8 -*-

from odoo import models, fields, api, _


class SdVisualizeCalculate(models.Model):
    _name = 'sd_visualize.calculate'
    def calculate(self, function_name, diagram_id):
        print(f'------>  Calculate: {function_name} diagram_id: {diagram_id}')
        return {}
