/** @odoo-module */
import { registry } from "@web/core/registry"
import core from "web.core"
import FormView from "web.FormView"
import FormController from "web.FormController"
import FormRenderer from "web.FormRenderer"
    import viewRegistry from 'web.view_registry';
    const { useState, onWillStart, onMounted, onWillUnmount } = owl.hooks

let VisualizeDiagramEditFormController = FormController.extend({


})

let VisualizeDiagramEditFormRenderer = FormRenderer.extend({
    start: function(){
        let self = this;
        // todo: add eventListener on page resize
            onMounted(async ()=>{
                console.log('Render start onMounted', self)
//                self.el.addEventListener("resize", self.updateBoxes);
                core.bus.on("resize", self, self.updateBoxes);
            });
            onWillUnmount(()=>{
                self.el.removeEventListener("resize", self.updateBoxes)
                console.log('Render start onWillUnmount')
            });
        return this._super.apply(this, arguments);
    },
    updateBoxes: function(e){
        console.log(e)
    },
    _render: function(){
        let self = this;
        this.rec_id = this.state.data.id
        this.value_res_ids = this.state.data.values.res_ids

        console.log('VisualizeDiagramView: _render', this.rec_id,this.value_res_ids, this)
        this._getDiagramData()
            .then(data=>{
                        self.values = data;
                        self._loadValues(data)
                        })
        return this._super.apply(this, arguments);

    },
    _loadValues: function(values){
//        console.log('this._loadValues(values):', values, this, this.el.querySelector('.diagram_image'))

    },
    _getDiagramData: async function(){
        let self = this;
        const values = await this._rpc({
            model: "sd_visualize.values",
            method: "search_read",
            fields: ["id", "display_name", "display_type"],
            domain: [["id", "in", this.value_res_ids],["display", "=", true]],
        }).then(data=> {
            self.value_res_ids = data.map(rec=> rec.id)
            return data;
        })
        const locations = await this._rpc({
            model: "sd_visualize.location",
            method: "search_read",
            fields: ["value_id", "point_x",],
            domain: [["diagram", "=", this.rec_id],["value_id", "in", this.value_res_ids],],
        })
        const values_locations = await this._rpc({
            model: "sd_visualize.location",
            method: "values_locations",
            args:[[], self.rec_id]
//            fields: ["value_id", "point_x",],
//            domain: [["diagram", "=", this.rec_id],["value_id", "in", this.value_res_ids],],
        }).then(data=> console.log('values_locations1:', JSON.parse(data)))

        // todo: unite the values and locations as values


        return values
    },


})

let VisualizeDiagramEditFormView = FormView.extend({
//    hasControlPanel: false,
//    withControlPanel: false,
    config: _.extend({}, FormView.prototype.config, {
//        Controller: VisualizeDiagramEditFormController,
        Renderer: VisualizeDiagramEditFormRenderer,
    }),
})

viewRegistry.add("visualize_diagram_edit", VisualizeDiagramEditFormView);
export default {
    VisualizeDiagramEditFormView,
//    VisualizeDiagramEditFormController,
}