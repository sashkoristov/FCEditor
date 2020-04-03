/**
 * custom implementation of class 'mxHierarchicalLayout'
 *
 * @author Ben Walch, 2019-2020
 */
import mxgraph from '../../mxgraph';

const {mxHierarchicalLayout} = mxgraph;

import * as afcl from '../../afcl';
import * as cellDefs from '../cells';
import * as mxGraphOverrides from '../';
import * as CellGenerator from '../util/CellGenerator';

class HierarchicalLayout extends mxHierarchicalLayout {

    execute(parent, roots) {
        if (parent instanceof mxGraphOverrides.Cell && parent.getType() == cellDefs.parallel.type) {
            // create a 'fake' root element as a copy of the non-working fork-subcell
            let forkCell = parent.getChildOfType(cellDefs.fork.name);
            let dummy = CellGenerator.generateVertexCell(cellDefs.dummy);

            // set dummy as source for all outgoing connections of fork
            for (let edge of forkCell.getOutgoingEdges()) {
                dummy.insertEdge(edge, true);
            }
            this.graph.addCell(dummy, parent);


            super.execute(parent, [dummy]);

            // set back to state before dummy
            for (let edge of dummy.getOutgoingEdges()) {
                forkCell.insertEdge(edge, true);
            }
            this.graph.removeCells([dummy], true);

        } else {
            super.execute(parent, roots);
        }
    }

    findRoots(parent, vertices) {
        let roots = [];

        /*
        if (parent instanceof mxGraphOverrides.Cell && parent.getType() == cellDefs.parallel.type) {
            let forkCell = parent.getChildOfType(cellDefs.fork.name);
            if (forkCell.getOutgoingEdges().length > 0) {
                roots = [forkCell]
            }
        }
        */

        if (roots.length == 0) {
            roots = super.findRoots(parent, vertices);
        }

        return roots;
    }

    isPort(cell) {
        if (cell instanceof mxGraphOverrides.Cell &&
            (cell.getType() == cellDefs.fork.name || cell.getType() == cellDefs.join.name)) {
            return false;
        }
        return super.isPort(cell);
    }

    isVertexIgnored(cell) {
        if (cell instanceof mxGraphOverrides.Cell &&
            (cell.getType() == cellDefs.fork.name || cell.getType() == cellDefs.join.name)) {
            return true;
        }
        return super.isVertexIgnored(cell);
    }

    placementStage(initialX, parent) {

        return super.placementStage(initialX, parent);
    }

    setVertexLocation(cell, x, y) {
        if (cell instanceof mxGraphOverrides.Cell &&
            (cell.getType() == cellDefs.fork.name || cell.getType() == cellDefs.join.name)) {
            // do nothing
        } else {
            super.setVertexLocation(cell, x, y);
        }
    }

}

export default HierarchicalLayout;