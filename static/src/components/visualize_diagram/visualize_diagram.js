/** @odoo-module */
import { registry } from "@web/core/registry"
const { Component } = owl
const { useState, onWillStart, onMounted} = owl.hooks
import { useBus, useEffect, useService } from '@web/core/utils/hooks';

export class VisualizeDiagram extends Component {
    async setup(action){
        let self = this;
        super.setup();
        self.res_id = self.props.action && self.props.action.context.active_id ? self.props.action.context.active_id : 0
        this.orm = useService("orm")
        this.state = useState({
            id: this.res_id,
            diagram: [],
        })
        onWillStart(async ()=>{
            self.state.diagram = await self.env.services.orm.searchRead("sd_visualize.diagram",[['id', '=', 7]] )
            console.log("VisualizeDiagram will Start:", self, self.res_id, self.state.diagram)

        })
        onMounted(()=> {
        console.log("VisualizeDiagram Mounted:", this, this.state.diagram)

        })
//        console.log("VisualizeDiagram", this.action)
    }
}
VisualizeDiagram.template = "sd_visualize.visualize_diagram_template"
registry.category("actions").add("sd_visualize.visualize_diagram", VisualizeDiagram)
