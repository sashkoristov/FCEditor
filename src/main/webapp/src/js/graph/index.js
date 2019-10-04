import mxgraph from '../mxgraph';

import BaseFunction from "../afcl/functions/BaseFunction";

const { mxGraph, mxMultiplicity, mxUtils } = mxgraph;

class Graph extends mxGraph {

    // override label specific functions for custom value objects at a cell
    // https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell
    convertValueToString(cell) {
        if (cell.value instanceof BaseFunction) {
            return cell.value.label;
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

export { Graph, Multiplicity }