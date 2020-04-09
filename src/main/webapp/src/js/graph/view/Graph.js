/**
 * custom implementation of class 'mxGraph'
 *
 * @author Ben Walch, 2018-2019
 */
import mxgraph from '../../mxgraph';
const { mxGraph, mxConstants, mxUtils, mxConnectionConstraint, mxPoint, mxRectangle } = mxgraph;

import ConnectionHandler from '../handler/ConnectionHandler';
import Cell from '../model/Cell';
import * as afcl from '../../afcl';
import * as cellDefs from '../cells';

/**
 * Graph
 *
 * subclass of mxGraph
 * for overriding
 */
class Graph extends mxGraph {

    /**
     * Creates and returns a new mxConnectionHandler to be used in this graph.
     * use here our own connection handler
     *
     */
    createConnectionHandler() {
        return new ConnectionHandler(this);
    }

    /**
     * overrides the create vertex to return an instance of Cell
     *
     * @param mxCell parent
     * @param string id
     * @param obj value
     * @param float x
     * @param float y
     * @param float width
     * @param float height
     * @param string style
     * @param boolean relative
     */
    createVertex(parent, id, value, x, y, width, height, style, relative) {
        let v = super.createVertex(parent, id, value, x, y, width, height, style, relative);

        // copy all properties and methods of 'v' to our custom cell obj and return that
        return Object.assign(new Cell(), v);
    }

    /**
     * Initializes the graph
     *
     * @param DOMNode container
     */
    init(container) {
        super.init(container);
    }

    /**
     * returns true if graph is empty
     */
    isEmpty() {
        let parent = this.getDefaultParent();
        return !parent.children || parent.children?.length == 0;
    }

    /**
     *
     * @param mxCell cell
     */
    getLabel(cell) {
        if (
            cell.edge ||
            cell.value instanceof afcl.functions.BaseFunction ||
            cell.type == cellDefs.start.name ||
            cell.type == cellDefs.end.name
        ) {
            return super.getLabel(cell);
        }
        return null;
    }

    /**
     * converts a cell's user object to a string
     *
     * @param mxCell cell
     *
     * @see https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxCell-js.html#mxCell
     */
    convertValueToString(cell) {
        if (cell.value instanceof afcl.functions.BaseFunction) {
            return cell.value.getName();
        }
        return super.convertValueToString(cell);
    }

    /**
     * Sets the new label for a cell
     *
     * @see https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraph-js.html#mxGraph.cellLabelChanged
     *
     * @param mxCell cell
     * @param string newValue
     * @param boolean autoSize
     */
    cellLabelChanged(cell, newValue, autoSize) {
        if (cell.isEdge()) {
            // disable for edges except cases from Switch
            if (cell.getTerminal(true) != null && cell.getTerminal(true).getValue() instanceof afcl.functions.Switch) {
                super.cellLabelChanged(cell, newValue, autoSize);
            }
        } else if (cell.isVertex()) {
            // disallow atomic functions
            if (cell.getValue() instanceof afcl.functions.AtomicFunction) {
                return;
            }
            // but allow the rest
            if (cell.getValue() instanceof afcl.functions.BaseFunction) {
                cell.getValue().setName(newValue);
                super.cellLabelChanged(cell, cell.getValue(), false);
            }
        }
    }

    /**
     * returns true if cell is a port
     *
     * @param mxCell cell
     * @return {boolean}
     */
    isPort(cell) {
        // fork and join are relative, but no port
        if (cell instanceof Cell && [cellDefs.fork.name, cellDefs.join.name].includes(cell.getType())) {
            return false;
        }
        return super.isPort(cell);
    };

    /**
     * returns true if cell is a pool
     *
     * @param mxCell cell
     * @return {boolean}
     */
    isPool(cell) {
        return this.isSwimlane(cell) && this.isSwimlane(cell.getParent());
    }

    /**
     * returns true if a connection between source and target is valid
     *
     * @param mxCell source
     * @param mxCell target
     *
     * @return boolean
     */
    isValidConnection(source, target) {
        return super.isValidConnection(source, target)
    }

    /**
     *
     * @param mxCell target
     * @param [mxCell] cells
     * @param mxEvent mouseEvent
     *
     * @return boolean
     */
    isValidDropTarget(target, cells, mouseEvent) {
        // disallow start and end cells to be dropped in 'container' cells (swimlanes)
        if (this.isSwimlane(target)) {
            for (let cell of cells) {
                if (cell.type && (cell.type == cellDefs.start.name || cell.type == cellDefs.end.name)) {
                    return false;
                }
            }
        }
        return super.isValidDropTarget(target, cells, mouseEvent);
    }

    /**
     *
     * @param mxCell cell
     * @param object context
     */
    validateCell(cell, context) {
        if (cell.isVertex() && cell instanceof Cell) {
            // cells at outermost level
            if (cell.getParent() == this.getDefaultParent()) {
                let error = '';
                if (!this.hasPathToCell(cell, cellDefs.start.name, mxConstants.DIRECTION_NORTH)) {
                    error += 'no path to a start node found' + "\n";
                }
                if (!this.hasPathToCell(cell, cellDefs.end.name, mxConstants.DIRECTION_SOUTH)) {
                    error += 'no path to an end node found' + "\n";
                }
                return error.length > 0 ? error : null;
            }
            // cells in swimlanes
            else if (cell.getParent().getValue() instanceof afcl.functions.Parallel) {
                let error = '';
                if (!this.hasPathToCell(cell, cellDefs.fork.name, mxConstants.DIRECTION_NORTH)) {
                    error += 'no path to fork found' + "\n";
                }
                if (!this.hasPathToCell(cell, cellDefs.join.name, mxConstants.DIRECTION_SOUTH)) {
                    error += 'no path to join found' + "\n";
                }
                return error.length > 0 ? error : null;
            }
        }
        return super.validateCell(cell, context);
    }

    /**
     * returns true if there exist a path in the graph to a cell of given type
     * @param Cell cell
     * @param string type
     * @param string direction
     * @return {boolean|boolean|*}
     */
    hasPathToCell(cell, type, direction) {
        if (cell instanceof Cell && cell.getType() == type) {
            return true;
        }
        let edges = direction == mxConstants.DIRECTION_NORTH ? this.getModel().getIncomingEdges(cell) : this.getModel().getOutgoingEdges(cell);
        if (edges.length > 0) {
            return this.hasPathToCell(direction == mxConstants.DIRECTION_NORTH ? this.getModel().getTerminal(edges[0], true) : this.getModel().getTerminal(edges[0], false), type, direction);
        }
        return false;
    }

    /**
     * validates the given cell
     *
     * @param mxCell cell
     * @returns {string|null}
     */
    getCellValidationError(cell) {
        // super call validates all multiplicities, etc
        return super.getCellValidationError(cell);
    }

    /**
     * validates the edge to be inserted/changed
     *
     * @see https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraph-js.html#mxGraph.getEdgeValidationError
     *
     * @param mxCell edge
     * @param mxCell source
     * @param mxCell target
     * @return {string|null}
     */
    getEdgeValidationError(edge, source, target) {
        let err = super.getEdgeValidationError(edge, source, target);

        if (err != null) {
            return err;
        }

        if (source.id == target.id) {
            return 'source and target of a connection must not be the same';
        }

        // connection can only be between cells with the same parent
        if (source.parent != target.parent) {
            return 'source and target cells of a connection must not have different parents';
        }

        // enforce port constraints:
        // an 'in' port must not connect to another 'in' port
        // an 'out' port must not connect to another 'out' port
        // in general, source and target port for an edge must not be the same
        // a connection can not be created from an 'in' port
        // a connection can not be created to an 'out' port
        if (this.connectionHandler.isConnecting()) {
            let sourcePort = null, targetPort = null;
            if (this.connectionHandler.sourceConstraint != null) {
                sourcePort = this.connectionHandler.sourceConstraint.id;
            }
            if (this.connectionHandler.constraintHandler.currentConstraint != null) {
                targetPort = this.connectionHandler.constraintHandler.currentConstraint.id;
            }
            if (sourcePort != null && targetPort != null) {
                if (sourcePort == 'in') {
                    return 'input port of node is not valid for a connection source';
                }
                if (targetPort == 'out' || targetPort == 'then' || targetPort == 'else') {
                    return 'output port of node is not valid for a connection target';
                }
                if (sourcePort == targetPort) {
                    return 'source port and target port must not be the same';
                }
            }
        }

        // disallow loops over multiple steps
        if (this.hasLoop(target, source)) {
            return 'this edge produces a loop.';
        }

        return null;
    }

    /**
     * returns true if there exists a loop between two given cells
     *
     * @param currentCell
     * @param start
     * @return {boolean}
     */
    hasLoop(currentCell, start) {
        if (currentCell == start) {
            return true;
        }
        let outgoingEdges = this.getModel().getOutgoingEdges(currentCell);
        if (outgoingEdges.length == 0) {
            return false;
        }
        let res = false;
        for (let e of outgoingEdges) {
            res = this.hasLoop(this.getModel().getTerminal(e, false), start);
            if (res) {
                return res;
            }
        }
        return false;
    }

    /**
     * Returns all possible ports for a given terminal
     *
     * @see https://github.com/jgraph/mxgraph/blob/master/javascript/examples/portrefs.html#L99
     *
     * @param mxCellState terminal
     * @param boolean source
     */
    getAllConnectionConstraints(terminal, source) {
        if (terminal != null && terminal.cell != null)
        {
            if (terminal.cell.isVertex() && cellDefs[terminal.cell.style] && cellDefs[terminal.cell.style].ports) {
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

    /**
     * @see https://github.com/jgraph/mxgraph/blob/master/javascript/examples/portrefs.html#L134
     *
     * @param mxCell edge
     * @param mxCell terminal
     * @param boolean source
     * @param mxConnectionConstraint constraint|null
     */
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

    /**
     * @see https://github.com/jgraph/mxgraph/blob/master/javascript/examples/portrefs.html#L152
     *
     * @param mxCellState edge
     * @param mxCellState terminal
     * @param boolean source
     * @return {mxConnectionConstraint|null}
     */
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

        return super.getConnectionConstraint(edge, terminal, source);
    };

    /**
     *
     * @param mxCellState vertex
     * @param mxConnectionConstraint constraint
     *
     * @return mxPoint
     */
    getConnectionPoint(vertex, constraint) {
        if (constraint.id != null && vertex != null && vertex.cell != null) {
            var port = cellDefs[vertex.cell.style]?.ports[constraint.id];

            if (port != null) {
                constraint = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
            }
        }

        return super.getConnectionPoint(vertex, constraint);
    };

    /**
     *
     * use port id as tooltip when hovering over a port,
     * otherwise use the cell label (default implementation)
     *
     * @param mxCellState state
     * @param DOMNode node
     * @param float x
     * @param float y
     * @return {string|null}
     */
    getTooltip(state, node, x, y) {

        var tip = null;

        // check if cell has ports ...
        if (cellDefs[state.cell.style]) {
            let ports = cellDefs[state.cell.style].ports;

            // create a 6x6 rectangle where the mouse pointer is,
            // relative to the hovered cell
            let relPoint = mxUtils.convertPoint(state.shape.node, x, y);
            let relRect = new mxRectangle(relPoint.x - 3, relPoint.y - 3, 6, 6);
            relRect.x = relRect.x > 0 ? relRect.x : 0;
            relRect.y = relRect.y > 0 ? relRect.y : 0;

            for (let portId in ports) {
                let port = ports[portId];
                // create the 6x6 rectangle for the port
                let portRect = new mxRectangle(
                    (state.cell.geometry.width * port.x) - 3,
                    (state.cell.geometry.height * port.y) - 3,
                    6,
                    6
                );
                portRect.x = portRect.x > 0 ? portRect.x : 0;
                portRect.y = portRect.y > 0 ? portRect.y : 0;

                // if the intersect, return the port id as tooltip
                if (mxUtils.intersects(relRect, portRect)) {
                    return portId;
                }
            }
        }

        return tip || super.getTooltip(state, node, x, y);
    }

    /**
     * /**
     * Overrides the parent implementation to respect non-movable cells
     * and filter them out
     *
     * @param cells
     * @param border
     * @param moveGroup
     * @param topBorder
     * @param rightBorder
     * @param bottomBorder
     * @param leftBorder
     * @return {*|void}
     */
    updateGroupBounds(cells, border, moveGroup, topBorder, rightBorder, bottomBorder, leftBorder) {
        if (cells != null && Array.isArray(cells)) {
            cells = cells.filter(c => {
                let style = this.getCellStyle(c);
                return style[mxConstants.STYLE_MOVABLE] != null ? style[mxConstants.STYLE_MOVABLE] : true;
            });
        }

        return super.updateGroupBounds(cells, border, moveGroup, topBorder, rightBorder, bottomBorder, leftBorder);
    }

    /**
     * Overrides the parent implementation to respect non-movable cells
     * and filter them out
     *
     * @param cells
     * @param dx
     * @param dy
     * @param clone
     * @param target
     * @param evt
     * @param mapping
     * @return {*|void}
     */
    moveCells(cells, dx, dy, clone, target, evt, mapping) {

        if (cells != null && Array.isArray(cells)) {
            cells = cells.filter(c => {
                let style = this.getCellStyle(c);
                return style[mxConstants.STYLE_MOVABLE] != null ? style[mxConstants.STYLE_MOVABLE] : true;
            });
        }

        return super.moveCells(cells, dx, dy, clone, target, evt, mapping);
    }

}

export default Graph;