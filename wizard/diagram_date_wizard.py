
# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo import Command
from colorama import Fore
from datetime import datetime, date
from datetime import timedelta
from odoo.exceptions import ValidationError, UserError

# #############################################################################
class SdVisualizeDiagramDateWizard(models.TransientModel):
    _name = 'sd_visualize.diagram_date.wizard'
    _description = 'Diagram Date Wizard'

    select_date = fields.Date(default=lambda self: date.today())
    diagram = fields.Many2one('sd_visualize.diagram', default=lambda self: self.env.context.get('active_id'))

    # @api.onchange('select_date')
    # def first_date_change(self):
    #     context = self.env.context
    #     print(f'-----------> context: {context}')

    def update_diagram(self):
        read_form = self.read()[0]
        data = {'form_data': read_form}
        context = dict(self.env.context)
        context['report_date'] = data.get('select_date')
        diagram = self.env['sd_visualize.diagram'].browse(context.get('active_id'))
        diagram['select_date'] = read_form.get('select_date')
        print(f'----------->\n data.get("select_date"): {read_form} \ndiagram: {diagram.select_date}\n')
        return {'context': context}

        # return self.env.ref('sd_payaneh_nafti.daily_report').report_action(self, data=data)