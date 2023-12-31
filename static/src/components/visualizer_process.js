/** @odoo-module **/
const { Component } = owl
import { registry } from "@web/core/registry"
import { DatePicker, DateTimePicker } from "@web/core/datepicker/datepicker"
        console.log('visualize_datepicker main')

export class VisualizeShowDiagram extends Component {
    setup(){
        console.log('visualize_datepicker')
    }
}
VisualizeShowDiagram.template = "sd_visualize.visualize_show_diagram"
VisualizeShowDiagram.components = { DatePicker, DateTimePicker }
registry.category("views").add("visualize_show_diagram", VisualizeShowDiagram)

