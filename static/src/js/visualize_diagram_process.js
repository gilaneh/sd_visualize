/** @odoo-module **/
/**
 * This From Controller creates monitoring data boxes on the diagram image
 */
    import FormController from 'web.FormController';
    import FormView from 'web.FormView';
    import FormRenderer from 'web.FormRenderer';
    import viewRegistry from 'web.view_registry';
    import session from 'web.session';
    import { loadJS } from "web.ajax";
    const { onMounted, onWillUnmount, onWillStart, useExternalListener, useRef, useState, useSubEnv } = owl.hooks;
    import { DatePicker, DateTimePicker } from "@web/core/datepicker/datepicker"

    let pointer = Object();
    let editMode = false
    let moveMode = false

    var VisualizeDiagramProcessFormController = FormController.extend({
        events: {
            'click .sd_visualize_image_page': '_onClickImagePage',
            'click .draggable_setting': '_onClickDraggableSetting',
            'click .visualize_draggable_div': '_onClickDraggableDiv',
            'click .diagram_process_form_view_image ': '_onClickImage',
//            'click .btn_print_pdf ': '_print_pdf',
        },
        start: function(){
            let self = this;
//              console.log('Controller start')
//            onresize = (e) => { self._print_pdf_button()}

            return this._super.apply(this, arguments).then(function(){
                $(document).keyup(function(ev){
                    if(ev.key === 'Escape'){ self._clearDraggableDiv(ev);}
                });

                self._print_pdf_button()

            });
        },
        _print_pdf_button: function(){
//            console.log('_print_pdf_button', this)
            let btn_print_pdf = this.el.querySelector('.btn_print_pdf')
            if (!btn_print_pdf){return}
            btn_print_pdf.classList.remove('btn-success', 'btn-dark')
            if (window.devicePixelRatio < 1.3){
                btn_print_pdf.classList.add('btn-dark')
                btn_print_pdf.title = 'Zoom out the browser'
                return false
            }
            btn_print_pdf.classList.add('btn-success')
            btn_print_pdf.title = 'Take a snapshot'

            return true
        },
        _print_pdf: function(e){
            if (!this._print_pdf_button()){return}

            html2canvas(document.querySelector(".diagram_process_form_view_image")).then(canvas => {

                let img = canvas.toDataURL("image/png", 1);
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
        },
        _onClickImagePage: function(e){
            let self = this;
            setTimeout(function(){
                let saveButton = self.el.querySelector('.o_form_button_save');
                if(saveButton){
                    saveButton.click();
                }
            }, 100);
//            setTimeout(function(){
//                let editButton = self.el.querySelector('.o_form_button_edit');
//                if(editButton){
//                    editButton.click();
//                    editMode = true;
//                }
//            }, 400);
        },
        saveRecord: function (recordID, options) {
            let self = this;
            recordID = recordID || this.handle;
            const localData = this.model.localData[recordID];
            const changes = localData._changes || {};
//            console.log('arash',recordID,localData,changes, pointer)
//todo:
                let def = self._savePointerLocation(localData.data.id).then(data => console.log('_savePointerLocation', data));
//                let def = undefined;
                editMode = false;

            return Promise.all([def, this._super.apply(this, arguments), ]);
        },
        _savePointerLocation: function(res_id){
            let self = this;
//            console.log('pointer', pointer)
            return self._rpc({
                                model: 'sd_visualize.diagram',
                                method: 'set_diagram_locations',
                                args: [false, pointer],
                            })
                            .then(data => JSON.parse(data))
                            .then(data => data)
                            .catch(e => console.log(e));
        },
        _onEdit: function () {
            let self = this;
            this._super.apply(this, arguments);
            editMode = true;
        },
        _applyChanges: function (dataPointID, changes, event) {
            let self = this;
//            let saveIt = setTimeout(function(){
//                                                    self.saveChanges(self.handle);
//                                                }, 300);
            return Promise.all([this._super.apply(this, arguments)]);

//            return this._super(...arguments).then(() => {
////                if (event.data.force_save && 'stage_id' in changes) {
//                if ( 'task' in changes) {
//                console.log('_applyChanges: ',self.handle, changes, )
//
//            /** todo: the boxs must be render again.
//            *   But there is an issue. The function _getLocation gets data from the database which is not updated
//            *   while it is not saved.
//            */
//
//                }
//            });
        },
        _onClickDraggableSetting: function(ev){
            /**
             * It hides all the settings div on the the page and then shows the current div
             */
//             console.log('_onClickDraggableSetting', ev);

//            document.querySelectorAll('.draggable_setting_div').forEach(el =>{
//                el.classList.remove('d-none');
//                el.classList.add('d-none');
//            })
//            ev.target.nextSibling.classList.toggle('d-none');
        },
        _clearDraggableDiv: function(ev){
            if(editMode){
               let setting_div =  document.querySelectorAll('.draggable_setting_div');
               setting_div.forEach(el =>{
                                        el.classList.remove('d-none');
                                        el.classList.add('d-none');
                                        })
               let setting_label =  document.querySelectorAll('.visualize_settings_label');
               setting_label.forEach(el =>{
                                        el.classList.remove('d-none');
                                        el.classList.add('d-none');
                                        })
               let draggable_div =  document.querySelectorAll('.visualize_draggable_div');
                draggable_div.forEach(el =>{
                                        el.classList.remove('draggable_zindex');
                                        })

               let box_content =  document.querySelectorAll('.visualize_box_content');
                box_content.forEach(el =>{
                                        el.classList.remove('border', 'border-warning');
                                        })

            }
        },
        _onClickImage: function(ev){
            if(editMode && ev.target.parentElement.classList.contains('diagram_process_form_view_image')){
                this._clearDraggableDiv(ev);
                let box_content =  document.querySelectorAll('.visualize_box_content');
                box_content.forEach(el =>{
                                        el.classList.add('border', 'border-warning');
                                        })
               let label_div =  document.querySelectorAll('.visualize_settings_label');
               label_div.forEach(el =>{
                                        el.classList.remove('d-none');
                                        })
            }
        },
        _onClickDraggableDiv: function(ev){
            if(editMode ){
//                console.log(ev)
                this._clearDraggableDiv(ev);
                ev.currentTarget.classList.add('draggable_zindex');
                ev.currentTarget.childNodes[0].classList.remove('d-none');
                ev.currentTarget.childNodes[1].classList.remove('d-none');
                ev.currentTarget.childNodes[2].classList.add('border', 'border-warning');
            }
        },
    });

    var VisualizeDiagramProcessRenderer = FormRenderer.extend({
        events: {
            'click .btn_print_pdf ': '_print_pdf',
            'click .visualize_datepicker ': '_visualize_datepicker',
            'change  .form-select-month, .form-select-year, .form-select-day ': 'onDateChange',
            'click .select_date_update ': 'onDateChange',
        },
        /**
         * @override
         */
        start: function(){
            let self = this;
            var res = this._super.apply(this, arguments);
            console.log('Render start',)
            onMounted(async ()=>{
                self.onDateChange('render')
                window.addEventListener("resize", self._print_pdf_button);
//                this.updateSize();
                  self._print_pdf_button()
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

            });
            onWillUnmount(()=>{
            window.removeEventListener("resize", self._print_pdf_button)
                  console.log('Render start onWillUnmount')
            });
            this._interact();
            return res
        },
        _render(){
            var res = this._super.apply(this, arguments);
            console.log('Render _render')
            return res
        },


        onDateChange: function(e){
            let self = this;
//            console.log('onChaneyDate', e, this)
                let dt = moment();
            if (e == 'render') {
//                console.log(moment().format('YYYY MM DD'), moment().format('jYYYY jMM jDD'))
                let sl = this.el.querySelector('.select_date_update')
                sl.childNodes[0].children[0].value = dt.format('jYYYY');
                sl.childNodes[1].children[0].value = dt.format('jMM');
                sl.childNodes[2].children[0].value = dt.format('jDD');
            }
            else if (e.target.classList.contains("btn_date_update")) {
                let year = e.currentTarget.childNodes[0].children[0]
                let month = e.currentTarget.childNodes[1].children[0]
                let day = e.currentTarget.childNodes[2].children[0]
//                console.log('select_date_update',year.value, month.value, day.value, )
                let date = moment(`${year.value}/${month.value}/${day.value}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                self.updateBoxes(date)
            }
        },



        _visualize_datepicker: function(){
            console.log('visualize_datepicker')
        },
        _print_pdf_button: function(){
            let btn_print_pdf = document.querySelector('.btn_print_pdf')
//            console.log('_print_pdf_button',btn_print_pdf,  window)
            if (!btn_print_pdf){return}
            btn_print_pdf.classList.remove('btn-success', 'btn-dark')
            if (window.devicePixelRatio < 1.3){
                btn_print_pdf.classList.add('btn-dark')
                btn_print_pdf.title = 'Zoom out the browser'
                return false
            }
            btn_print_pdf.classList.add('btn-success')
            btn_print_pdf.title = 'Take a snapshot'

            return true
        },
        _print_pdf: function(e){
            if (!this._print_pdf_button()){return}

            html2canvas(document.querySelector(".diagram_process_form_view_image"),{logging: false}).then(canvas => {

                let img = canvas.toDataURL("image/png", 1);
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
        },
        _sleep:function(ms){
            new Promise(r => setTimeout(r, ms));
        },
        _dragMoveListener: function(event) {
            if(moveMode){
                return
            }
//            let self = this;
            const box_id = Number(event.target.id.replace('data_box_', ''));
            var target = event.target
            // keep the dragged position in the data-x/data-y attributes
            var x = target.getAttribute('data-x') ? (parseFloat(target.getAttribute('data-x'))) + event.dx : pointer[box_id]['point_x'] || 0;
            var y = target.getAttribute('data-y') ? (parseFloat(target.getAttribute('data-y'))) + event.dy : pointer[box_id]['point_y'] || 0;
            // translate the element
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            pointer[box_id]['point_x'] = Math.round(x);
            pointer[box_id]['point_y'] = Math.round(y);
            // update the position attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        },
        _updateView: function (a) {
            let self = this;
            var res = this._super.apply(this, arguments);
            self.updateBoxes()
            return res
        },
        updateBoxes: function(date){
            let self = this;
            date = typeof date == 'string' ? date : moment().format("YYYY-MM-DD")
            console.log('updateBoxes:', date, typeof date)
            setTimeout(function(){
                        console.log('updateBoxes: setTimeout', date, typeof date)

                self._getLocation(date).then(data => self._createBoxes(data));
            }, 100, date)
        },
        _getLocation: function(date){
            let self = this;
//            console.log('_getLocation', self.state)
            console.log('_getLocation:', date, typeof date)

            return self._rpc({
                                model: 'sd_visualize.diagram',
                                method: 'get_diagram_values',
                                args: [[], date, self.state.res_id, self.state.data.function_name],
                            })
                            .then(data => JSON.parse(data))
                            .then(data => data)
                            .catch(e => console.log(e));
         },
        _createBoxes: function(data){
            let self = this;
            let diagram = self.el.querySelectorAll('.diagram_process_form_view_image');
            console.log('diagram', diagram)
            let diagramImage = diagram[0].querySelector('img');
             if (!editMode) {
                diagram[0].innerHTML = '';
                diagram[0].appendChild(diagramImage)
            }
            diagramImage.classList.remove('img-fluid');
            let chartBox = '';
            let chartBoxList = Object();
            if(data && data[0] != undefined && data[0].data[0] != undefined ){
                let values = data[0].data[0].values
//                console.log('values: ', values, Array.from(values))
                  let session_rtl = session.user_context.lang == 'fa_IR' ? true : false;

                values.forEach(value => {
                    pointer[value.loc_id] = value;
//                    console.log(pointer, value)
                    let containerDiv = document.createElement("div");
                    let settingDiv = document.createElement("div");
                    containerDiv.classList.add('visualize_draggable_div');
                    if (editMode) {
                        containerDiv.classList.add('draggable_move');

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

                    diagram[0].appendChild(containerDiv);
                    containerDiv.id = `data_box_${value.loc_id}`;
                    let boxContent = document.createElement("div");
                    containerDiv.appendChild(boxContent);
//                    console.log('value', value)

//                        todo: progress_plan?
                    let boxNameClass = value.point_label_show ? 'visualize_box_content_label' : 'visualize_box_content_label d-none'
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
                    console.log('typeof Plotly:', typeof Plotly, value.value_id)

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

                    containerDiv.style.transform = `translate(${value.point_x}px, ${value.point_y}px)`
                    containerDiv.style.width = value.point_w + 'px';
                    containerDiv.style.height = value.point_h + 'px';
                    containerDiv.style.color = value.point_color;
                    containerDiv.style.color = value.point_label_show;
                    containerDiv.style.borderColor = value.point_border;
                    containerDiv.style.borderWidth = value.point_border_show ? `${value.point_border_width}px` : '0px';
                    containerDiv.style.fontSize = value.point_size + 'px';

                });
            }
            let draggable_moves = self.el.querySelectorAll('draggable_move')
         },
        _fontSlider: function(fontSlider){
            fontSlider.addEventListener('change', e => {
                console.log(e.currentTarget.value);
            })
         },
        _interact: function(){
            let self = this;
            let moveCounter = 0;
            interact('.draggable_move')
            .draggable({
            // enable inertial throwing
            inertia: true,
            // keep the element within the area of it's parent
            modifiers: [
              interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
              })
            ],
            // enable autoScroll
            autoScroll: true,

            listeners: {
              // call this function on every dragmove event
              move (event){
                self._dragMoveListener(event);
              },

              // call this function on every dragend event
              end (event) {
                var textEl = event.target.querySelector('.drag-results')

                textEl && (textEl.innerText =
                  'rect: ' + Math.round(event.rect.left) + ' x ' + Math.round(event.rect.top) +
                  // '\npage: ' + Math.round(event.pageX) + ' x ' + Math.round(event.pageY) +
                  // '\nclient: ' + Math.round(event.client.x) + ' x ' + Math.round(event.client.y) +
                  // '\nx0: ' + Math.round(event.x0) + ' x ' + Math.round(event.y0) +
                  // '\nmoved a distance of ' +
                  (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
                             Math.pow(event.pageY - event.y0, 2) | 0))
                    .toFixed(2) + 'px')

              }
            }
          })
            .resizable({
                preserveAspectRatio: true,
                edges: { left: false, right: true, bottom: true, top: false }
            })
            .on('mouseover', function(event){
                if (event.originalEvent.srcElement.classList.contains('draggable_font_size')){
                    moveMode = true;
                }

            })
            .on('input', function(event){
                const box_id = Number(event.currentTarget.id.replace('data_box_', ''));
                    const chartBox = event.currentTarget.children[2].children[1]
                if (event.originalEvent.srcElement.classList.contains('draggable_font_size')){
                    let value = Number(event.originalEvent.srcElement.value);
                    event.currentTarget.style.fontSize = value + 'px';

                    if(chartBox && chartBox.classList.contains('chart_box')){
                        Plotly.relayout(chartBox, {font: {size: value} })
                    }
                    pointer[box_id]['point_size'] = value;
                } else if (event.originalEvent.srcElement.classList.contains('draggable_font_color')){
                    let value = event.originalEvent.srcElement.value;
                    event.currentTarget.style.color = value;
//                    todo: changing the color is changing the size to its last saved value and vice versa
//                    if(chartBox && chartBox.classList.contains('chart_box')){
//                        Plotly.relayout(chartBox, {font: {color: value} })
//                    }
                    pointer[box_id]['point_color'] = value;
                } else if (event.originalEvent.srcElement.classList.contains('draggable_border_show')){
                    const border_checked = event.originalEvent.srcElement.checked;
                    event.currentTarget.style.borderWidth =  border_checked ? '5px' : '0px';
                    pointer[box_id]['point_border_show'] = border_checked;
                } else if (event.originalEvent.srcElement.classList.contains('visualize_box_content_no_label')){
                    const label_checked = event.originalEvent.srcElement.checked;

                    let label = event.currentTarget.querySelector('.visualize_box_content_label');
                    label_checked ? label.classList.remove('d-none') : label.classList.add('d-none')

                    pointer[box_id]['point_label_show'] = label_checked;
                }else if (event.originalEvent.srcElement.classList.contains('draggable_border_color')){
                    let value = event.originalEvent.srcElement.value;
                    event.currentTarget.style.borderColor = value;
                        pointer[box_id]['point_border'] = value;
                }
            })
            .on('resizemove', function (event) {
                if(moveMode){
                    return
                }
                const box_id = Number(event.target.id.replace('data_box_', ''));
                var target = event.target;
//                        x = (parseFloat(target.getAttribute('data-x')) || localStorage.getItem('x')),
//                        y = (parseFloat(target.getAttribute('data-y')) || localStorage.getItem('y'));
//                        console.log(Math.round(x), Math.round(parseFloat(target.getAttribute('data-x'))), Math.round(event.dx),localStorage.getItem('x'))
//                const chartBox = event.target.querySelector('.chart_box')
                const chartBox = event.target.children[2].children[1]
//                console.log(event, event.target, chartBox)
                if(++moveCounter == 3 && chartBox.classList.contains('chart_box')){
                    moveCounter = 0;
                    Plotly.relayout(chartBox, {width: event.rect.width, height: event.rect.height  })
                }

                // update the element's style
                target.style.width  = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // translate when resizing from top or left edges
//                    x += event.deltaRect.left;
//                    y += event.deltaRect.top;
                pointer[box_id]['point_w'] = Math.round(event.rect.width);
                pointer[box_id]['point_h'] = Math.round(event.rect.height);

                // localStorage.setItem('x', x)
                // localStorage.setItem('y', y)
                // target.style.webkitTransform = target.style.transform =
                //     'translate(' + x + 'px,' + y + 'px)';

                // target.setAttribute('data-x', x);
                // target.setAttribute('data-y', y);
//                    target.style.fontSize = .15 * event.rect.width + 'px';
//                    localStorage.setItem('width', event.rect.width + 'px')
//                    localStorage.setItem('height', event.rect.height + 'px')
//                    localStorage.setItem('fontSize', target.style.fontSize)
                // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
                // target.textContent = event.rect.width + '×' + event.rect.height;
                });
        },
        _parseBooleansInObj: function (object) {
            const newObject = { ...object };
            Object.keys(newObject)
            .forEach((objKey) => {
              let value = newObject[objKey];
              value = (value === 'true' ? true : value === 'false' ? false : value);
              newObject[objKey] = value;
            });
            return newObject;
            }

    });

    var VisualizeDiagramProcessFormView = FormView.extend({
        config: _.extend({}, FormView.prototype.config, {
            Controller: VisualizeDiagramProcessFormController,
            Renderer: VisualizeDiagramProcessRenderer,

        }),
    });

    viewRegistry.add('visualize_diagram_process_form_view', VisualizeDiagramProcessFormView);

    export default {
        VisualizeDiagramProcessFormController: VisualizeDiagramProcessFormController,
        VisualizeDiagramProcessFormView: VisualizeDiagramProcessFormView,
        VisualizeDiagramProcessRenderer: VisualizeDiagramProcessRenderer,

    };
