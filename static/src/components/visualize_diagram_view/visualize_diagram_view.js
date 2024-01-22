/** @odoo-module */
import { registry } from "@web/core/registry"
import FormView from "web.FormView"
import FormController from "web.FormController"
import FormRenderer from "web.FormRenderer"
import session from 'web.session';
import viewRegistry from 'web.view_registry';
const { useState, onWillStart, onMounted, onWillUnmount } = owl.hooks

let VisualizeDiagramViewFormController = FormController.extend({

})

let VisualizeDiagramViewFormRenderer = FormRenderer.extend({
    events: _.extend({}, FormRenderer.prototype.events, {
//        'resize .diagram_image': '_onDiagramResize',
    }),
    start: function(){
        let self = this;
        // todo: add eventListener on page resize
        onMounted(async ()=>{
            window.addEventListener("resize", self._onResize);
        })
        onWillUnmount(async ()=>{
            window.removeEventListener("resize", self._onResize);
        })
        return this._super.apply(this, arguments);
    },

    _onResize: function(e){
        let self = this;
        let diagramImage = document.querySelector('.diagram_image').querySelector('img')
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
        this._getDiagramData()
            .then(data=>{
                self.state.diagramValues = JSON.parse(data);
                window.diagramValues = JSON.parse(data);
                self._loadValues(JSON.parse(data))
                return JSON.parse(data)
            })
        return this._super.apply(this, arguments);

    },
    _loadValues: function(values){
        let self = this;
        let imageEl = this.el.querySelector('.diagram_image')
        let session_rtl = session.user_context.lang == 'fa_IR' ? true : false;
        imageEl.style.direction = session_rtl ? 'ltr' : 'rtl'
        let diagramImage = imageEl.querySelector('img');

        let imageScaleW = (diagramImage.scrollWidth / values[0].image_x).toFixed(4)
        let imageScaleH = (diagramImage.scrollHeight /  values[0].image_y).toFixed(4)
        console.log('origin', values[0].image_x,'x', values[0].image_y,)
        console.log('Scale', imageScaleW,'x', imageScaleH,)
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
//        console.log('this._loadValues(values):', values, this, )

    },




    loadBoxEl: function(imageEl, divRec, session_rtl, imageScaleW, imageScaleH){
        let containerDiv = document.createElement("div");
        let boxContent = document.createElement("div");
        let boxNameClass= divRec.point_label_show ? 'visualize_box_content_label' : 'visualize_box_content_label d-none'

        imageEl.appendChild(containerDiv);
//        containerDiv.id = `data_box_${divRec.loc_id}`;
        containerDiv.appendChild(boxContent);
        containerDiv.classList.add('container_div_box', 'visualize_draggable_div', 'm-0')
        containerDiv.id = `container_div_box_${divRec.id}`
        if(divRec.display_type == 'data'){
            boxContent.innerHTML = `
                <div class="${boxNameClass}" >${divRec.display_name}</div>
                <div >${divRec.value} ${divRec.symbol ? divRec.symbol : ""}</div>
            `;
        }
        else if (divRec.display_type == 'image'){
            boxContent.innerHTML = `
                <div class="${boxNameClass}" >${divRec.name}</div>
                <div class="p-0"><img class="container p-0" src="/web/image?model=sd_visualize.values&id=${divRec.id}&field=image"/></div>

            `;
        }
        boxContent.classList.add('visualize_box_content', 'h-100', );
        boxContent.style.direction = session_rtl ? 'rtl' : 'ltr';
        containerDiv.style.position = 'absolute'
        containerDiv.style.transformOrigin = 'left top'
//        boxContent.classList.add('border', 'border-danger')
        let newWidth = Math.round(imageScaleW * divRec.point_x)
        let newHeight = Math.round(imageScaleW * divRec.point_y)
        containerDiv.style.transform = `matrix(${imageScaleW}, 0, 0, ${imageScaleW}, ${newWidth}, ${newHeight})`
        containerDiv.style.width = divRec.point_w + 'px';
        containerDiv.style.height = divRec.point_h + 'px';
        containerDiv.style.color = divRec.point_color;
        containerDiv.style.color = divRec.point_label_show;
        containerDiv.style.borderColor = divRec.point_border;
        containerDiv.style.borderWidth = divRec.point_border_show ? `${divRec.point_border_width}px` : '0px';
        containerDiv.style.fontSize = divRec.point_size + 'px';
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




    _createBoxes: function(data, diagram){
            let self = this;
            diagram = diagram ? diagram : self.el.querySelectorAll('.diagram_process_form_view_image');
            console.log('diagram', diagram)
            let diagramImage = diagram[0].querySelector('img');
             if (!editMode) {
                diagram[0].innerHTML = '';
                diagram[0].appendChild(diagramImage)
            }
            let chartBox = '';
            let chartBoxList = Object();
            if(data && data[0] != undefined && data[0].data[0] != undefined ){
                let values = data[0].data[0].values
//                console.log('values: ', values, Array.from(values))
                  let session_rtl = session.user_context.lang == 'fa_IR' ? true : false;
                    diagramImage.classList.remove('img-fluid');
                    let originWidth = diagramImage.width
                    let originHeight = diagramImage.height

                    if (!editMode) {
                        diagramImage.classList.add('img-fluid');
                        }
                    let imageScaleW = (diagramImage.scrollWidth / originWidth).toFixed(4)
                    let imageScaleH = (diagramImage.scrollHeight / originHeight).toFixed(4)

                    console.log('imageScale WxH:', imageScaleW, imageScaleH)
//                    imageScale = .3
//                diagram[0].innerHTML += `
//                <div class="h4 text-right">
//                    <div>originWidth: ${originWidth}</div>
//                    <div>width: ${diagramImage.width}</div>
//                    <div>scrollWidth: ${diagramImage.scrollWidth}</div>
//                    <div>imageScale: ${imageScale}</div>
//                </div>`
                values.forEach(value => {
                    pointer[value.loc_id] = value;
//                    console.log(pointer, value)
                    let containerDiv = document.createElement("div");
                    let settingDiv = document.createElement("div");
                    containerDiv.classList.add('visualize_draggable_div');
                    if (editMode) {
                        containerDiv.classList.add('draggable_move');
//                        diagramImage.classList.remove('img-fluid');

                       let labelDiv = document.createElement("div");
                       labelDiv.innerHTML = `<div class="col-12" style="direction:${session_rtl ? 'rtl' : 'ltr'};">
                       ${value.name}
                       </div>`;
                       labelDiv.classList.add('visualize_settings_label', 'border', 'border-info', 'text-dark', 'd-none', 'bg-info-light' );
                       containerDiv.appendChild(labelDiv);

                        settingDiv.classList.add('draggable_setting_div', 'border', 'border-info', 'text-dark', 'd-none' )
                        containerDiv.appendChild(settingDiv);
                        settingDiv.innerHTML = `

                            <div class="row flex-nowrap">
                                <div class="col-5">Font: </div>
                                <div class="col-1"></div>
                                <div class="col-6">
                                    <input type="color" class="draggable_font_color" value="${value.point_color}"/>
                                </div>
                            </div>
                            <div class="row flex-nowrap">
                                <div class="col-5">Border: </div>
                                <div class="col-1">
                                    <input type="checkbox" class="draggable_border_show" ${value.point_border_show ? "checked" : ''}/>
                                </div>
                                <div class="col-6">
                                    <input type="color" class="draggable_border_color" value="${value.point_border}"/>
                                </div>
                            </div>
                            <div class="row flex-nowrap">
                                <div class="col-5">Label: </div>
                                <div class="col-1">
                                    <input type="checkbox" class="visualize_box_content_no_label" ${value.point_label_show ? "checked" : ''}/>
                                </div>
                                <div class="col-6">
                                </div>
                            </div>

                        `;

                        //font size slider
                       let fontSlider = document.createElement("input");
                       fontSlider.type = 'range';
                       fontSlider.id = `fontSlider_${value.loc_id}`;
                       fontSlider.classList.add('draggable_font_size');
                       fontSlider.setAttribute('value', value.point_size);
                       fontSlider.setAttribute('step', '5');
                       fontSlider.setAttribute('min', '10');
                       fontSlider.setAttribute('max', '100');
                       settingDiv.appendChild(fontSlider);
                       fontSlider.addEventListener('mouseleave', e => moveMode = false)
                    }
//                    containerDiv.setAttribute('style', 'overflow: hidden;')

                    diagram[0].appendChild(containerDiv);
                    containerDiv.id = `data_box_${value.loc_id}`;
                    let boxContent = document.createElement("div");
                    containerDiv.appendChild(boxContent);
//                    console.log('value', value)

//                        todo: progress_plan?
                    let boxNameClass= value.point_label_show ? 'visualize_box_content_label' : 'visualize_box_content_label d-none'
//                    console.log('value.image',value.display_type,value.image)
                    if(value.display_type == 'data'){
                    boxContent.innerHTML = `
                        <div class="${boxNameClass}" >${value.name}</div>
                        <div >${value.value} ${value.symbol ? value.symbol : ""}</div>
                    `;
                    } else if (value.display_type == 'chart'){
                    boxContent.innerHTML = `
                        <div class="${boxNameClass}" >${value.name}</div>
                        <div id="chart_${value.value_id}" class="chart_box p-0" > </div>
                    `;
                    let plot_value = JSON.parse(value.value);
//                    console.log('boxing:', plot_value)
                    let plot_config = plot_value.config || {}
                    let plot_layout = plot_value.layout || {}
                    if (plot_layout){
                        plot_layout['width'] =  value.point_w
                        plot_layout['height'] =  value.point_h
                        plot_layout['font'] =  {size: value.point_size, color: value.point_color,}
                    }
//                    console.log('typeof Plotly:', typeof Plotly, value.value_id)

                    typeof Plotly == 'undefined' ? '' :
                        Plotly.newPlot(`chart_${value.value_id}`, plot_value.data, plot_layout, plot_config)
                    } else if (value.display_type == 'image'){
                    boxContent.innerHTML = `
                        <div class="${boxNameClass}" >${value.name}</div>
                        <div class="p-0"><img class="container p-0" src="/web/image?model=sd_visualize.values&id=${value.value_id}&field=image"/></div>

                    `;
                    }
//                    boxContent.classList.add( 'h-100', 'w-100');
                    boxContent.classList.add('visualize_box_content', 'h-100', );
                    boxContent.style.direction = session_rtl ? 'rtl' : 'ltr';

//                    containerDiv.style.transform = `translate(${value.point_x}px, ${value.point_y}px)`

                    containerDiv.style.transformOrigin = 'left top'
//                    containerDiv.setAttribute('style', `-webkit-transform: matrix(${imageScale}, 0, 0, ${imageScale}, ${Number(imageScale * value.point_x)}, ${Number(imageScale * value.point_y)});`)
//                    containerDiv.setAttribute('style', `transform: matrix(${imageScale}, 0, 0, ${imageScale}, ${Number(imageScale * value.point_x)}, ${Number(imageScale * value.point_y)});`)
//                    containerDiv.style['transform'] = `matrix(${imageScale}, 0, 0, ${imageScale}, ${Number(imageScale * value.point_x)}, ${Number(imageScale * value.point_y)})`

                    containerDiv.style.transform = `matrix(${imageScaleW}, 0, 0, ${imageScaleH}, ${Number(imageScaleW * value.point_x)}, ${Number(imageScaleH * value.point_y) - 10})`
//                    containerDiv.style.transform = `scale(${imageScaleW}, ${imageScaleH}) translate( ${Number(imageScaleW * value.point_x)}px, ${Number(imageScaleH * value.point_y) - 10}px)`

                    containerDiv.style.width = value.point_w + 'px';
                    containerDiv.style.height = value.point_h + 'px';
                    containerDiv.style.color = value.point_color;
                    containerDiv.style.color = value.point_label_show;
                    containerDiv.style.borderColor = value.point_border;
                    containerDiv.style.borderWidth = value.point_border_show ? `${value.point_border_width}px` : '0px';
                    containerDiv.style.fontSize = value.point_size + 'px';

                });
            }
            if(!editMode){
                let coverDiv = document.createElement('div')
                diagram[0].appendChild(coverDiv)
                coverDiv.classList.add('temp_cover_div', 'border', )
                coverDiv.style.width = '100%'
                coverDiv.style.height = '100%'
                coverDiv.style.display = 'block'
                coverDiv.style.position = 'absolute'
                coverDiv.style.top = '0'
//                coverDiv.innerHTML = '<div class="text-center h1 text-danger border border-danger">Cover Div</div>'
            }
            let draggable_moves = self.el.querySelectorAll('draggable_move')
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
        }).then(data=> {
//        console.log('values_locations view:', JSON.parse(data))
        return data
        })

        // todo: unite the values and locations as values


        return values_locations
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
//    VisualizeDiagramViewFormController,
}