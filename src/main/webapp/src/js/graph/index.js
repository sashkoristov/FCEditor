import mxgraph from "../mxgraph";

const {
    mxConstants,
    mxUtils
} = mxgraph;

import * as cellDefs from './cells';
import Graph from './view/graph';
import Multiplicity from './view/Multiplicity';

// ToDo: override better?
// this is used in mxEdgeStyle.js (Ortho and EntityRelation)
let mxUtilsGetPortConstraints = mxUtils.getPortConstraints;
mxUtils.getPortConstraints = function(terminal, edge, source, defaultValue)
{
    var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
    var id = edge.style[key];

    // if the cell has ports defined
    if (cellDefs[terminal.cell.style] && cellDefs[terminal.cell.style].ports) {
        var port = cellDefs[terminal.cell.style].ports[id];

        if (port != null) {
            return port.constraint;
        }
    }

    // set the constraints for vertices inside container cells
    // this can be the general default behaviour (maybe ?)
    if (terminal.cell.parent.type && terminal.cell.parent.type == cellDefs.container.name) {
        return source ? mxConstants.DIRECTION_MASK_SOUTH : mxConstants.DIRECTION_MASK_NORTH;
    }

    return mxUtilsGetPortConstraints.apply(this, arguments);
};

export { Graph, Multiplicity }