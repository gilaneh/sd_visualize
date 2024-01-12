/** @odoo-module */

import AbstractAction from 'web.AbstractAction';
import { registry } from "@web/core/registry"
import { action_registry } from 'web.core';
const { Component, hooks} = owl;
const { useExternalListener, useRef, useState } = hooks;

export const VisualizeShowDiagram = AbstractAction.extend({
    contentTemplate: 'sd_visualize.visualize_show_diagram_template',
//    hasControlPanel: true,
    init(parent, action, options={}) {
        this.state = useState({
            id: 44,
        })
        this.att = action.params.id
//        console.log('VisualizeShowDiagram', action )
        this._super.apply(this, arguments);
        }
})
//registry.category("actions").add('sd_visualize.visualize_show_diagram', VisualizeShowDiagram )
action_registry.add('sd_visualize.visualize_show_diagram', VisualizeShowDiagram )