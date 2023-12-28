# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import jdatetime
from datetime import date


class SdVisualizeCalculate(models.Model):
    _name = 'sd_visualize.calculate'

    def calculate(self, function_name, diagram_id):
        # print(f'------>  Calculate: {function_name} diagram_id: {diagram_id}')
        return {}

    def float_num(self, num, points=2):
        fnum = round(num, int(points))
        frac = fnum - int(fnum)
        return str(int(fnum)) if frac == 0 else str(fnum)

    def convert_date(self, lang='en_US', this_date=date.today()):
        if lang == 'fa_IR':
            # first_day = jdatetime.date.fromgregorian(date=end_date).replace(day=1)
            # next_month = first_day.replace(day=28) + timedelta(days=5)
            # last_day = (next_month - timedelta(days=next_month.day)).togregorian()
            # first_day = first_day.togregorian
            s_this_date = jdatetime.date.fromgregorian(date=this_date).strftime("%Y/%m/%d")
        else:
            # first_day = end_date.replace(day=1)
            # next_month = first_day.replace(day=28) + timedelta(days=5)
            # last_day = next_month - timedelta(days=next_month.day)

            s_this_date = this_date.strftime("%Y/%m/%d")

        return s_this_date
