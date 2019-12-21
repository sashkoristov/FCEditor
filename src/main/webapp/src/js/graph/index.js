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

    var port = cellDefs[terminal.cell.style].ports[id];

    if (port != null) {
        return port.constraint;
    }

    return mxUtilsGetPortConstraints.apply(this, arguments);
};

export { Graph, Multiplicity }