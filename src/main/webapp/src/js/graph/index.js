import mxgraph from '../mxgraph';

import BaseFunction from "../afcl/functions/BaseFunction";

const { mxGraph, mxShape, mxMultiplicity, mxUtils } = mxgraph;
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
            if (cellDefs[terminal.cell.style].connectionConstraints) {
                return cellDefs[terminal.cell.style].connectionConstraints
            }
        }
        return null;
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