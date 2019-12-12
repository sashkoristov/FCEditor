import mxgraph from '../mxgraph';
import dotImage from '../../assets/images/dot.gif';

import BaseFunction from "../afcl/functions/BaseFunction";

const { mxGraph, mxConstants, mxMultiplicity, mxUtils, mxConnectionConstraint, mxPoint, mxConstraintHandler, mxImage, } = mxgraph;
import * as cellDefs from './cells';

class Graph extends mxGraph {

    // override label specific functions for custom value objects at a cell
    // https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell
    convertValueToString(cell) {
        if (cell.value instanceof BaseFunction) {
            return cell.value.getLabel();
        }
        return super.convertValueToString(cell);
    }

    cellLabelChanged(cell, newValue, autoSize) {
        if (cell.value instanceof BaseFunction)
        {
            // Clones the value for correct undo/redo
            var elt = mxUtils.clone(cell.value);
            elt.label = newValue;
            newValue = elt;
        }
        super.cellLabelChanged(cell, newValue, autoSize);
    }

    getAllConnectionConstraints(terminal, source) {
        if (terminal != null && terminal.cell != null)
        {
            if (terminal.cell.isVertex() && cellDefs[terminal.cell.style].ports) {
                var ports = cellDefs[terminal.cell.style].ports;
                var cstrs = [];

                for (var id in ports)
                {
                    var port = ports[id];

                    var cstr = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
                    cstr.id = id;
                    cstrs.push(cstr);
                }

                return cstrs;
            }
        }
        return null;
    }

    setConnectionConstraint(edge, terminal, source, constraint)
    {
        if (constraint != null)
        {
            var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;

            if (constraint == null || constraint.id == null)
            {
                this.setCellStyles(key, null, [edge]);
            }
            else if (constraint.id != null)
            {
                this.setCellStyles(key, constraint.id, [edge]);
            }
        }
    };

    getConnectionConstraint(edge, terminal, source)
    {
        var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
        var id = edge.style[key];

        if (id != null)
        {
            var c =  new mxConnectionConstraint(null, null);
            c.id = id;

            return c;
        }

        return null;
    };

    getConnectionPoint(vertex, constraint) {
        if (constraint.id != null && vertex != null && vertex.cell != null) {
            var port = cellDefs[vertex.cell.style].ports[constraint.id];

            if (port != null) {
                constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
            }
        }

        return super.getConnectionPoint(vertex, constraint);
    };

}

class Multiplicity extends mxMultiplicity {
    checkType(graph, value, type, attr, attrValue) {
        if (value != null) {
            if (typeof value == 'object' && typeof type == 'function') {
                if (value instanceof type) {
                    return value[attr] == attrValue;
                } else {
                    return false;
                }
            }
        }
        return super.checkType(graph, value, type, attr, attrValue);
    }
}

// ToDo: override better?
var mxUtilsGetPortConstraints = mxUtils.getPortConstraints;
mxUtils.getPortConstraints = function(terminal, edge, source, defaultValue)
{
    var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
    var id = edge.style[key];

    var port = cellDefs[terminal.cell.style].ports[id];

    if (port != null)
    {
        return port.constraint;
    }

    return mxUtilsGetPortConstraints.apply(this, arguments);
};

// Replaces the port image
mxConstraintHandler.prototype.pointImage = new mxImage(dotImage, 10, 10);

export { Graph, Multiplicity }