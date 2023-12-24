/** @odoo-module **/

import FormController from 'web.FormController';
import FormView from 'web.FormView';
import viewRegistry from 'web.view_registry';
import FormRenderer from 'web.FormRenderer';
//import Plotly from 'km_test.plotly.min'
//import { Plotly } from "./plotly.min";
import { loadJS } from "web.ajax";
const { onWillStart, useExternalListener, useRef, useSubEnv } = owl.hooks;

    let renderChart = function(self, project_id, start_date, end_date, chart_type){
        let chartDiv =  self.el.querySelector(".chart_div");
        readData(self, project_id, start_date, end_date, chart_type)
            .then(data => {
//            console.log('renderChart:', data)
            Plotly.newPlot(chartDiv, data.plot_data, data.plot_layout, {showSendToCloud:true});
            })
            .catch(e => console.log('_readData:', e));
        }

    let readData = function(self, project_id, start_date, end_date, chart_type){
        return self._rpc({
                            model: 'km_test.production',
                            method: 'get_data_plotly',
                            args: [false, project_id, start_date, end_date, chart_type ],
                        })
                        .then(data => JSON.parse(data))
                        .then(data => data)
                        .catch(e => console.log(e));
        };

    var VisualizeProcessFormController = FormController.extend({
    events:{
        'click .bar_btn': '_barBtnSubmit',
        'click .line_btn': '_lineBtnSubmit',
        'click .pie_btn': '_pieBtnSubmit',
    },
        _onFieldChanged: function (ev) {
            let self = this;
            let project_id = self.renderer.state.data['project'];
            let start_date = self.renderer.state.data['start_date'];
            let end_date = self.renderer.state.data['end_date'];
            console.log('_onFieldChanged', ev);
            if(ev.data.changes.project){
                project_id = ev.data.changes.project.id;
            } else if (ev.data.changes.start_date){
                start_date = ev.data.changes.start_date;
            } else if (ev.data.changes.end_date){
                end_date = ev.data.changes.end_date;
            }
            renderChart(self, project_id, start_date, end_date);
            return this._super.apply(this, arguments);
        },
        _barBtnSubmit: function(ev){
            let self = this;
            let project_id = self.renderer.state.data['project'].data.id;
            let start_date = self.renderer.state.data['start_date'];
            let end_date = self.renderer.state.data['end_date'];
            renderChart(self, project_id, start_date, end_date, 'bar');

        },
        _lineBtnSubmit: function(ev){
            let self = this;
            let project_id = self.renderer.state.data['project'].data.id;
            let start_date = self.renderer.state.data['start_date'];
            let end_date = self.renderer.state.data['end_date'];
            renderChart(self, project_id, start_date, end_date, 'line');

        },
        _pieBtnSubmit: function(ev){
            let self = this;
            let project_id = self.renderer.state.data['project'].data.id;
            let start_date = self.renderer.state.data['start_date'];
            let end_date = self.renderer.state.data['end_date'];
            renderChart(self, project_id, start_date, end_date, 'pie');

        },
    });

    var VisualizeProcessFormRenderer = FormRenderer.extend({
        start: async function(){
            let self = this;
            console.log('VisualizeProcessFormRenderer')
            var res = this._super.apply(this, arguments);
            return res
        },
        _render: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                let chartCanvas =  self.el.querySelector(".chart_canvas");
                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add('chart_buttons_div')
                const chartDiv = document.createElement("div");
                chartDiv.classList.add('chart_div')
                chartCanvas.appendChild(buttonsDiv);
                chartCanvas.appendChild(chartDiv);

                const barBtn = document.createElement("button");
                barBtn.classList.add('bar_btn', 'btn','btn-secondary', 'fa', 'fa-bar-chart-o', 'mx-1')
                buttonsDiv.appendChild(barBtn)
                const lineBtn = document.createElement("button");
                lineBtn.classList.add('line_btn', 'btn','btn-secondary', 'fa', 'fa-area-chart','mx-1')
                buttonsDiv.appendChild(lineBtn)
                const pieBtn = document.createElement("button");
                pieBtn.classList.add('pie_btn', 'btn','btn-secondary', 'fa', 'fa-pie-chart','mx-1')
                buttonsDiv.appendChild(pieBtn)


//                const url = "/sd_visualize/static/src/lib/plotlyjs_2.27.1/plotly.min.js";
//                var localeReady = loadJS(url);
                Promise.all([localeReady])
                    .then(function(){
                        let project_id = self.state.data['project'].data.id;
                        let start_date = self.state.data['start_date'];
                        let end_date = self.state.data['end_date'];
                        renderChart(self, project_id, start_date, end_date);
                    })
                    .catch(e => console.log('loading plotly:', e));
            });
        },
    });


    var VisualizeProcessFormView = FormView.extend({
        config: _.extend({}, FormView.prototype.config, {
             Controller: VisualizeProcessFormController,
             Renderer: VisualizeProcessFormRenderer,
        }),
    });

viewRegistry.add("visualize_process", VisualizeProcessFormView);

//    viewRegistry.add('km_test_data_view', KmDataViewFormView);
    export default {
        VisualizeProcessFormView: VisualizeProcessFormView,
        VisualizeProcessFormRenderer: VisualizeProcessFormRenderer,
    };