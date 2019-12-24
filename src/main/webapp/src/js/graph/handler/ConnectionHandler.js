/**
 * custom implementation of class 'mxConnectionHandler'
 *
 * @author Ben Walch, 2018-2019
 */

import mxgraph from '../../mxgraph';
const {
    mxConnectionHandler,
    mxCellState
} = mxgraph;

import * as cellDefs from '../cells';

class ConnectionHandler extends mxConnectionHandler {

    /**
     * Disables floating connections (only connections via ports allowed)
     *
     * @param mxCell cell
     */
    isConnectableCell(cell) {
        if (cell && cell.type && (cell.type === cellDefs.fork.name || cell.type === cellDefs.join.name)) {
            return true;
        }
        return false;
    };

    /**
     * Enables connect preview for the default edge style
     *
     * @param mxEvent mouseEvent
     */
    createEdgeState(mouseEvent)
    {
        let edge = this.graph.createEdge(null, null, null, null, null);
        return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };

    /**
     *
     * @param mxConnectionConstraint c1
     * @param mxConnectionConstraint c2
     */
    //checkConstraints(c1, c2) {
    //    return super.checkConstraints(c1, c2);
    //}
}

export default ConnectionHandler;