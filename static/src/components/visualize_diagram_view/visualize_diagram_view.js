/** @odoo-module */
import { registry } from "@web/core/registry"
import FormView from "web.FormView"
import FormController from "web.FormController"
import FormRenderer from "web.FormRenderer"
import session from 'web.session';
import datepicker from 'web.datepicker';
import viewRegistry from 'web.view_registry';
import { loadJS } from "web.ajax";
import { _t } from 'web.core';

import { DatePicker, DateTimePicker } from "@web/core/datepicker/datepicker";

const { useState, onWillStart, onMounted, onWillUnmount } = owl.hooks

let VisualizeDiagramViewFormController = FormController.extend({

})

let VisualizeDiagramViewFormRenderer = FormRenderer.extend({
    events: _.extend({}, FormRenderer.prototype.events, {
        'click .o_datepicker': '_onDatepicker',
        'click .btn_print_pdf ': '_print_pdf',
        'click .previous_day_btn, .next_day_btn ': '_onNextPreviousDay',

    }),
    willStart: async function(){
        let res = this._super.apply(this, arguments);
//        console.log('will start')
        try {
            Plotly
        } catch (e) {
            const url = "/sd_visualize/static/src/lib/plotlyjs_2.27.1/plotly.min.js";
            await loadJS(url);
            }
        try {
            html2canvas
        } catch (e) {
            const url = "/sd_visualize/static/src/lib/html2canvas/html2canvas.min.js";
            await loadJS(url);
            }
        return res
    },
    start: function(){
        let self = this;
        // todo: add eventListener on page resize
        onMounted(async ()=>{
            window.addEventListener("resize", self._onResize);
        })
        onWillUnmount(async ()=>{
            window.removeEventListener("resize", self._onResize);
        })
        return this._super.apply(this, arguments).then(()=>{
            self._loadDateInput()
        });
    },
    _onDatepicker: function(ev){
//    console.log('_onDatepicker', this.DateTimeW)

        ev.preventDefault();
        ev.stopPropagation();
//        this.DateTimeW.$input.do_show()
//        this.DateTimeW.$input.click();

    },
    _onNextPreviousDay: function(ev){
        let value = this.DateTimeW.getValue()
        if (ev.currentTarget.classList.contains('previous_day_btn')){
//            value = value.add(-1 * this._dayDiff(), 'days');
            value = this._newDate(value, 'down');

        }else if (ev.currentTarget.classList.contains('next_day_btn')){
//            value = value.add(this._dayDiff(), 'days');
            value = this._newDate(value, 'up');
        }
        this.DateTimeW.setValue(value);
//        todo: if you hit the button several times, it will show data on top of the old one.
        this._updateElements(value.format("YYYY-MM-DD"))
        },
    _newDate: function(value, direction){
        let newValue = value;
        const newDateDir = direction == 'up' ? 1 : -1
        if(this.state.data.report_duration == 'daily'){
            newValue = value.add(newDateDir, 'day')
        } else if(this.state.data.report_duration == 'weekly'){
            newValue = value.add(newDateDir, 'week').endOf('week')
        } else if(this.state.data.report_duration == 'monthly'){
            newValue = value.add(newDateDir, 'jmonth').endOf('jmonth')
        }
        return newValue;
    },

    _dayDiff: function(){
        let dayDiff = 1
        if(this.state.data.report_duration == 'weekly'){
            dayDiff = 7
        } else if(this.state.data.report_duration == 'monthly'){
//        todo: make sure it is on the other month based on 29 or 31 days of some months
            dayDiff = moment().endOf('jmonth')
        } else if(this.state.data.report_duration == 'seasonal'){
            dayDiff = 90
        } else if(this.state.data.report_duration == 'half_year'){
            dayDiff = 180
        } else if(this.state.data.report_duration == 'yearly'){
            dayDiff = 365
        }
        return dayDiff;
    },
    _onResize: function(e){
        let self = this;
        let diagramImage = document.querySelector('.diagram_image').querySelector('img')
//        console.log('values[0]:', window.diagramValues[0].image_x)

        let imageScaleW = (diagramImage.scrollWidth / window.diagramValues[0].image_x).toFixed(4)
        let imageScaleH = (diagramImage.scrollHeight /  window.diagramValues[0].image_y).toFixed(4)
        let boxContents = document.querySelectorAll('.container_div_box')
        boxContents.forEach(boxContent => {
            let container_div_box_attributes = window.diagramValues.filter(r=> `container_div_box_${r.id}` == boxContent.id)
            let newWidth = Math.round(imageScaleW * container_div_box_attributes[0].point_x)
            let newHeight = Math.round(imageScaleW * container_div_box_attributes[0].point_y)
            boxContent.style.transform = `matrix(${imageScaleW}, 0, 0, ${imageScaleH}, ${newWidth}, ${newHeight})`
//            let debugDiv = boxContent.querySelector('.debug_div')
//            debugDiv.innerHTML = `
//            <div class="row" style="font-size: 15px; background: #ffffff75;">
//               <div class="col"> ${newWidth} x ${newHeight} </div>
//               <div class="col"> ${imageScaleW}</div>
//            </div>
//            `;
        })
    },
    _render: function(){
        let self = this;
        this.rec_id = this.state.data.id
        this.value_res_ids = this.state.data.values.res_ids
        this._updateElements()
        return this._super.apply(this, arguments);
    },
    _updateElements: function(date){
        let self = this;
        this._getDiagramData(date)
            .then(data=>{
                let container_div_box = self.el.querySelectorAll('.container_div_box')
                container_div_box.forEach(div => div.remove())
                self.state.diagramValues = JSON.parse(data);
                window.diagramValues = JSON.parse(data);
                self._loadValues(JSON.parse(data))
                return JSON.parse(data)
            })
            .catch(err => console.log('cannot get diagram data:', err))
    },
    _loadDateInput: function(){
        let self = this;
        this.DateTimeW = new datepicker.DateWidget(this, {useCurrent: true});
        this.DateTimeW.appendTo(this.$('.start_date_field')).then(function() {
//            console.log('datetime', self.DateTimeW.$input)
//            self.DateTimeW.$input.attr('placeholder', _t("Today"));
//            let format = session.user_context.lang == 'fa_IR' ? "jYYYY/jMM/jDD" : "YYYY/MM/DD"

            self.DateTimeW.setValue(self._setValue());
            self.$('.o_note_show, .o_note').toggleClass('d-none');
        });
        let selfChange = false
         this.DateTimeW.on('datetime_changed', this, function () {
                var value = this.DateTimeW.getValue();
                if (!selfChange && ((!value && this.value) || (value && !this._isSameValue(value)))) {
                    selfChange = true
                    value = self._setValue(value)
//                    self.DateTimeW.setValue(value);
//                    console.log('Date', value , self._setValue(value))
                    this._updateElements(value.format("YYYY-MM-DD"))
                    selfChange = false

                }
            });
    },
    _setValue: function(value=moment()){
//        let value = moment()
        if(this.state.data.report_duration == 'weekly'){
            value = value.endOf('week').subtract(1, 'week')
        }
        else if(this.state.data.report_duration == 'monthly'){
            value = value.endOf('jmonth')
        }
//else if(this.state.data.report_duration == 'monthly'){
////        todo: make sure it is on the other month based on 29 or 31 days of some months
//            value = moment().endOf('jmonth')
////            console.log(moment().endOf('jmonth').subtract(30, 'days'))
//        } else if(this.state.data.report_duration == 'seasonal'){
//            dayDiff = 90
//        } else if(this.state.data.report_duration == 'half_year'){
//            dayDiff = 180
//        } else if(this.state.data.report_duration == 'yearly'){
//            dayDiff = 365
//        }
    return value
    },
    _isSameValue: function (value) {
        if (this.value === false || value === false) {
            return this.value === value;
        }
        return value.isSame(this.value, 'day');
    },
    _loadValues: function(values){
        let self = this;
        if(values[0] == undefined) return;
        let imageEl = this.el.querySelector('.diagram_image')

//         todo: the o_web_client contains direction: rtl which it makes the page horizontally over size.
//              I have found that cssrtl has a problem with the plotly.
//              https://rtlcss.com/learn/usage-guide/control-directives/

//        let o_main_navbar = document.querySelector('.o_main_navbar')
//        document.body.classList.remove('o_web_client')

//        let o_content = document.querySelector('.o_content')
//        let chart_1 = document.createElement('div')
//        chart_1.id = 'chart_chart_1'
//        document.body.appendChild(chart_1)
//
//        Plotly.newPlot1('chart_chart_1', {})

        let session_rtl = session.user_context.lang == 'fa_IR' ? true : false;
        imageEl.style.direction = session_rtl ? 'ltr' : 'rtl'
        let diagramImage = imageEl.querySelector('img');

//        console.log('values[0]', values[0])

        let imageScaleW = (diagramImage.scrollWidth / values[0].image_x ).toFixed(4)
        let imageScaleH = (diagramImage.scrollHeight /  values[0].image_y ).toFixed(4)
//        console.log('origin', values[0].image_x,'x', values[0].image_y,)
//        console.log('Scale', imageScaleW,'x', imageScaleH,)
        values.forEach(divRec =>{
            self.loadBoxEl(imageEl, divRec, session_rtl, imageScaleW, imageScaleH)

        })
        let coverDiv = document.createElement('div')
        imageEl.appendChild(coverDiv)
        coverDiv.classList.add('temp_cover_div', 'border', )
        coverDiv.style.width = '100%'
        coverDiv.style.height = '100%'
        coverDiv.style.display = 'block'
        coverDiv.style.position = 'absolute'
        coverDiv.style.top = '0'

    },




    loadBoxEl: function(imageEl, divRec, session_rtl, imageScaleW, imageScaleH){
        let containerDiv = document.createElement("div");
        let boxContent = document.createElement("div");
        let boxNameClass= divRec.point_label_show ? 'visualize_box_content_label' : 'visualize_box_content_label d-none'

        imageEl.appendChild(containerDiv);
//        containerDiv.id = `data_box_${divRec.loc_id}`;
        containerDiv.appendChild(boxContent);
        containerDiv.classList.add('container_div_box', 'visualize_draggable_div1', 'm-0')
        containerDiv.id = `container_div_box_${divRec.id}`
        boxContent.style.direction = session_rtl ? 'rtl' : 'ltr';
        containerDiv.style.position = 'absolute'
        containerDiv.style.transformOrigin = 'left top'

        containerDiv.style.color = divRec.point_color;
        containerDiv.style.color = divRec.point_label_show;
        containerDiv.style.borderColor = divRec.point_border;
        let newWidth = Math.round(imageScaleW * divRec.point_x)
        let newHeight = Math.round(imageScaleW * divRec.point_y)
        containerDiv.style.transform = `matrix(${imageScaleW}, 0, 0, ${imageScaleW}, ${newWidth}, ${newHeight})`
        containerDiv.style.borderWidth = divRec.point_border_show ? `${divRec.point_border_width}px` : '0px';
        containerDiv.style.fontSize = divRec.point_size + 'px';

        if(divRec.display_type == 'data'){
            boxContent.innerHTML = `
                <div class="${boxNameClass}" >${divRec.display_name}</div>
                <div >${divRec.value} ${divRec.symbol ? divRec.symbol : ""}</div>
            `;
            boxContent.classList.add('visualize_box_content', );

        }
        else if(divRec.display_type == 'box'){
            boxContent.innerHTML = `
                <div class="${boxNameClass}" >${divRec.name}</div>
                <div >${divRec.value ? divRec.value : ''}</div>
            `;
            boxContent.classList.add('visualize_box_content', 'h-100', );
            containerDiv.style.width = divRec.point_w + 'px';
            containerDiv.style.height = divRec.point_h + 'px';
        }
        else if (divRec.display_type == 'image'){
            boxContent.innerHTML = `
                <div class="${boxNameClass}" >${divRec.name}</div>
                <div class="p-0"><img class="container p-0"
                src="/web/image?model=sd_visualize.values&id=${divRec.id}&field=image"/></div>
            `;
            boxContent.classList.add('visualize_box_content', 'h-100', );
            containerDiv.style.width = divRec.point_w + 'px';
            containerDiv.style.height = divRec.point_h + 'px';
        }
        else if (divRec.display_type == 'chart'){
                    boxContent.innerHTML = `
                        <div class="${boxNameClass}" >${divRec.name}</div>
                        <div id="chart_${divRec.id}" class="chart_box p-0" > </div>
                    `;
                    let plot_value = JSON.parse(divRec.value);
//                    console.log('boxing:', plot_value)
                    let plot_config = plot_value.config || {}
                    let plot_layout = plot_value.layout || {}
//                    plot_config['local'] = 'fr'
                    if (plot_layout){
                        plot_layout['width'] =  divRec.point_w
                        plot_layout['height'] =  divRec.point_h
                        plot_layout['font'] =  {size: divRec.point_size, color: divRec.point_color,}
                    }
//                    console.log('Plotly:', typeof Plotly, divRec.id)

                    typeof Plotly == 'undefined' ? '' :
                        Plotly.newPlot(`chart_${divRec.id}`, plot_value.data, plot_layout, plot_config)
                    }

        containerDiv.appendChild(boxContent)
//        let debugDiv = document.createElement('div')
//        debugDiv.classList.add('debug_div')
//        debugDiv.innerHTML = `
//        <div class="row" style="font-size: 15px; background: #ffffff75;">
//           <div class="col"> ${newWidth} x ${newHeight} </div>
//           <div class="col"> ${imageScaleW}</div>
//        </div>
//        `
//        containerDiv.appendChild(debugDiv)

    },
    _print_pdf_button: function(){
        let btn_print_pdf = document.querySelector('.btn_print_pdf')
//            console.log('_print_pdf_button',btn_print_pdf,  window)
        if (!btn_print_pdf){return}
        btn_print_pdf.classList.remove('btn-outline-primary', 'btn-dark')
        if (window.devicePixelRatio < .1){
            btn_print_pdf.classList.add('btn-outline-dark')
            btn_print_pdf.title = 'Zoom out the browser'
            return false
        }
        btn_print_pdf.classList.add('btn-outline-primary')
        btn_print_pdf.title = 'Take a snapshot'
        return true
    },
    _print_pdf: function(e){
//            console.log('render print pdf')
            if (!this._print_pdf_button()){return}
//            let coverDiv = document.querySelector('.temp_cover_div')
//            coverDiv.style.zIndex = -1
//            let diagram = document.querySelector(".diagram_process_form_view_image")
//            console.log(diagram)

            html2canvas(document.querySelector(".diagram_image"),{logging: false}).then(canvas => {

                let img = canvas.toDataURL("image/png", 1);
//                console.log("canvas", canvas, img)
                let img_el = document.createElement('img')
                img_el.src = img;
                let a_el = document.createElement('a')
                a_el.href = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
                // todo: download name must be generated based on report name and its date
                a_el.download = 'report.png'
                a_el.appendChild(img_el)
                document.body.appendChild(a_el)
                a_el.click()
                a_el.remove()
            });
//                        coverDiv.classList.remove('d-none')

        },
    _getDiagramData: async function(date=moment().format("YYYY-MM-DD")){
        let self = this;
//            console.log('_getDiagramData:', date, moment(date).format("jYYYY-jMM-jDD"))
        return await this._rpc({
                                model: 'sd_visualize.diagram',
                                method: 'get_diagram_values',
                                args: [[], date, self.state.res_id, self.state.data.function_name],
                            }).then(async (data)=>{
//                                console.log(data)
                                return await self._rpc({
                                            model: "sd_visualize.location",
                                            method: "values_locations",
                                            args:[[], self.rec_id]
                                        }).then(data=> {
                                        return data
                                        })
                            })

//        const values = await this._rpc({
//            model: "sd_visualize.values",
//            method: "search_read",
//            fields: ["id", "display_name", "display_type"],
//            domain: [["id", "in", this.value_res_ids],["display", "=", true]],
//        }).then(data=> {
//            self.value_res_ids = data.map(rec=> rec.id)
//            return data;
//        })
//        const locations = await this._rpc({
//            model: "sd_visualize.location",
//            method: "search_read",
//            fields: ["value_id", "point_x",],
//            domain: [["diagram", "=", this.rec_id],["value_id", "in", this.value_res_ids],],
//        })
//        const values_locations = await this._rpc({
//            model: "sd_visualize.location",
//            method: "values_locations",
//            args:[[], self.rec_id]
////            fields: ["value_id", "point_x",],
////            domain: [["diagram", "=", this.rec_id],["value_id", "in", this.value_res_ids],],
//        }).then(data=> {
////        console.log('values_locations view:', JSON.parse(data))
//        return data
//        })
//
//        // todo: unite the values and locations as values
//
//
//        return values_locations
    },


})

let VisualizeDiagramViewFormView = FormView.extend({
    hasControlPanel: false,
    withControlPanel: false,
    config: _.extend({}, FormView.prototype.config, {
//        Controller: VisualizeDiagramViewFormController,
        Renderer: VisualizeDiagramViewFormRenderer,
    }),
})

viewRegistry.add("visualize_diagram_view", VisualizeDiagramViewFormView);
export default {
    VisualizeDiagramViewFormView,
    VisualizeDiagramViewFormRenderer,
}