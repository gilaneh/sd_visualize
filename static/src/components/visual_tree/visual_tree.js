/** @odoo-module */
import viewRegistry from 'web.view_registry';
import { ControlPanel } from "@web/search/control_panel/control_panel";
import ListRenderer from 'web.ListRenderer';
import ListController from 'web.ListController';
import ListView from 'web.ListView';
import { useBus, useEffect, useService } from '@web/core/utils/hooks';

const { Component } = owl
const { xml } = owl.tags;

var VisualTreeListRenderer = ListRenderer.extend({
    events: _.extend({}, ListRenderer.prototype.events, {
//        'click .o_data_row': 'onDataRowClick',
    }),
    init: function(){
        return this._super.apply(this, arguments)

    },
    start: function(action){
        console.log('List Render', this.state)
        return this._super.apply(this, arguments)
    },
    onDataRowClick: function(e){
        let dataset_id = e.currentTarget.dataset.id
        console.log("dataset_id:",dataset_id)
    },
    _onRowClicked: async function (ev) {
        console.log('List _onRowClicked',this,  this.state.res_ids)
//        return
        // The special_click property explicitely allow events to bubble all
        // the way up to bootstrap's level rather than being stopped earlier.
        if (!ev.target.closest('.o_list_record_selector') && !$(ev.target).prop('special_click') && !this.no_open) {
            var id = $(ev.currentTarget).data('id');
                    console.log('id:', id, ev.currentTarget.parentElement.childNodes, this)

            if (id) {
//                this.trigger_up('open_record', { id: id, target: ev.target });
//                this.do_action({
//                    type: 'ir.actions.client',
//                    tag: 'sd_visualize.visualize_show_diagram',
//                    params: {id: Number(id.split("_").slice(-1)[0])},
//
//                })
                const action_id = await this._rpc({
                    model: 'ir.actions.actions',
                    method : 'search_read',
                    domain: [['name', '=', 'sd_visualize.visualize_diagram']],
                });
//                console.log('action_id', action_id)

//                this.do_action({
//                    type: 'ir.actions.client',
//                    res_model: 'sd_visualize.diagram',
//                    tag: 'sd_visualize.visualize_diagram',
//                    id: action_id[0].id,
////                    params: {id: Number(id.split("_").slice(-1)[0])},
////                    active_id: Number(id.split("_").slice(-1)[0]),
//                    context: {active_id: Number(id.split("_").slice(-1)[0])},
//
//                })
            }
        }
    },
})

var VisualTreeListView = ListView.extend({
    config: _.extend({}, ListView.prototype.config, {
        Renderer: VisualTreeListRenderer,
    }),
});

viewRegistry.add('visualize_tree_view', VisualTreeListView);
    export default {
        VisualTreeListRenderer: VisualTreeListRenderer,
    };
