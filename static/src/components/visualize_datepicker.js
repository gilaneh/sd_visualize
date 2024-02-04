/** @odoo-module **/
const { Component } = owl
import { registry } from "@web/core/registry"
import { DatePicker, DateTimePicker } from "@web/core/datepicker/datepicker"
import legacyViewRegistry from "web.view_registry";

export class VisualizeDatePicker extends Component {
    setup(){
    }
}
VisualizeDatePicker.template = "sd_visualize.visualize_datepicker"
VisualizeDatePicker.components = { DatePicker, DateTimePicker }
registry.category("fields").add("visualize_datepicker", VisualizeDatePicker)

