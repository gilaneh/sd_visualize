# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import jdatetime
from datetime import datetime, date, timedelta


class SdVisualizeCalculate(models.Model):
    _name = 'sd_visualize.calculate'

    def calculate(self, function_name, diagram_id, update_date):
        # print(f'------>\n  Calculate: {self.env.context} diagram_id: {diagram_id}\n ')

        return {}

    def float_num(self, num, points=2):
        fnum = round(num, int(points))
        frac = fnum - int(fnum)
        return str(int(fnum)) if frac == 0 else str(fnum)

    def convert_date(self, calendar='en_US', this_date=date.today()):
        if calendar == 'fa_IR':
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

    def month_start_end(self, this_date, month=0, calendar='fa_IR'):
        format = "%Y/%m/%d"
        # this_date = datetime.now()
        if calendar == 'fa_IR':
            month_delta = month if month < 0 or month > -60 else 0
            first_day_j = jdatetime.date.fromgregorian(date=this_date).replace(day=1)

            year_j = first_day_j.year
            month_j = first_day_j.month

            if month_j + month_delta > 0:
                month = month_j + month_delta
                year = year_j

            elif month_j + month_delta <= -60:
                month = month_j + month_delta + 72
                year = year_j - 6

            elif month_j + month_delta <= -48:
                month = month_j + month_delta + 60
                year = year_j - 5

            elif month_j + month_delta <= -36:
                month = month_j + month_delta + 48
                year = year_j - 4

            elif month_j + month_delta <= -24:
                month = month_j + month_delta + 36
                year = year_j - 3

            elif month_j + month_delta <= -12:
                month = month_j + month_delta + 24
                year = year_j - 2

            elif month_j + month_delta <= 0:
                month = month_j + month_delta + 12
                year = year_j - 1

            first_day_j = jdatetime.date(day=1, month=month, year=year)
            the_prev_month_j = first_day_j.replace(day=28) + timedelta(days=8)
            the_prev_month = the_prev_month_j.togregorian()

            first_p_day_j = jdatetime.date.fromgregorian(date=the_prev_month).replace(day=1)

            next_month = first_day_j.replace(day=28) + timedelta(days=8)
            last_day_j = (next_month - timedelta(days=next_month.day))
            last_day = last_day_j.togregorian()
            first_day = first_day_j.togregorian()

        else:
            first_day = this_date.replace(day=1)
            next_month = first_day.replace(day=28) + timedelta(days=5)
            last_day = next_month - timedelta(days=next_month.day)
            format = "%Y-%m-%d"

        return (first_day, last_day)