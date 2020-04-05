/**
 * implementation of hierarchical layout for AFCL cells
 * fixes layout of 'parallel' swimlanes with their subcells fork and join
 *
 * @author Ben Walch, 2019-2020
 */
import mxgraph from '../../mxgraph';

const {mxHierarchicalLayout} = mxgraph;

import * as cellDefs from '../cells';
import * as mxGraphOverrides from '../';
import * as CellGenerator from '../util/CellGenerator';
import Cell from "../model/Cell";

class AfclSwimlaneLayout extends mxHierarchicalLayout {

    execute(parent, roots) {
        if (parent instanceof mxGraphOverrides.Cell && parent.getType() == cellDefs.parallel.type) {
            // create a 'fake' root element as a copy of the non-working fork-subcell
            let forkCell = parent.getChildOfType(cellDefs.fork.name);
            let joinCell = parent.getChildOfType(cellDefs.join.name);
            let forkDummy = CellGenerator.generateVertexCell(cellDefs.dummy);
            let joinDummy = CellGenerator.generateVertexCell(cellDefs.dummy);

            // remove all incoming connections of join
            for (let edge of joinCell.getIncomingEdges()) {
                joinDummy.insertEdge(edge, false);
            }
            // set dummy as source for all outgoing connections of fork
            for (let edge of forkCell.getOutgoingEdges()) {
                forkDummy.insertEdge(edge, true);
            }
            this.graph.addCells([forkDummy, joinDummy], parent);
            this.graph.removeCells([forkCell, joinCell]);

            super.execute(parent, forkDummy);

            // set back to state before dummy
            for (let edge of forkDummy.getOutgoingEdges()) {
                forkCell.insertEdge(edge, true);
            }
            for (let edge of joinDummy.getIncomingEdges()) {
                joinCell.insertEdge(edge, false)
            }
            this.graph.addCells([forkCell, joinCell], parent);
            this.graph.removeCells([forkDummy, joinDummy], true);

            // refresh the graph
            this.graph.refresh();

        } else {
            super.execute(parent, roots);
        }
    }

    isPort(cell) {
        if (cell instanceof Cell && [cellDefs.fork.name, cellDefs.join.name].includes(cell.getType())) {
            return false;
        }
        return super.isPort(cell);
    }

    isVertexIgnored(cell) {
        if (cell instanceof Cell && [cellDefs.fork.name, cellDefs.join.name].includes(cell.getType())) {
            return false;
        }
        return super.isVertexIgnored(cell);
    }

}

export default AfclSwimlaneLayout;