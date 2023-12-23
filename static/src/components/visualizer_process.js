/** @odoo-module */
import { registry } from "@web/core/registry"
const { Component } = owl;
//import { formView } from "@web/views/form/form_view"
//import { FormController } from "@web/views/form/form_controller"
import FormController from 'web.FormController';
import FormView from 'web.FormView';
//import viewRegistry from 'web.view_registry';

class VisualizerProcessFormController extends FormController {
    setup() {
    super.setup()
        console.log('VisualizerProcess')
    }
}

export const visualizeProcessFormView = {
    ...FormView,
    controller: VisualizerProcessFormController
}
//VisualizerProcess.template = "sd_dash.OwlMainDashboard";
//VisualizerProcess.components = { KpiCard }
registry.category("views").add("visualize_process", visualizeProcessFormView);