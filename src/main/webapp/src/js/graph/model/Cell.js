/**
 * custom implementation of class 'mxCell'
 *
 * @author Ben Walch, 2018-2019
 */
import mxgraph from '../../mxgraph';
const { mxCell } = mxgraph;

import * as afcl from '../../afcl';
import * as cellDefs from '../cells';

class Cell extends mxCell {

    constructor(value, geometry, style) {
        super(value, geometry, style);
        this.type = null;
    }

    /**
     * @param String type
     */
    setType(type) {
        this.type = type;
    }

    /**
     * @param type
     * @returns {string|null}
     */
    getType(type) {
        return this.type;
    }

    /**
     *
     * @param Array children
     */
    setChildren(children) {
        this.children = children;
    }

    /**
     * @return Array children
     */
    getChildren() {
        return this.children ?? [];
    }

    /**
     * @return Array incomingEdges
     */
    getIncomingEdges() {
        return (this.edges == null) ? [] : this.edges.filter(e => e.getTerminal(false) == this);
    }

    /**
     * @return Array outgoingEdges
     */
    getOutgoingEdges() {
        return (this.edges == null) ? [] : this.edges.filter(e => e.getTerminal(true) == this);
    }

    /**
     * returns the first child cell which is
     * a vertex and has given type
     * @return {Cell|null}
     */
    getChildOfType(type) {
        return this.getChildren().filter(c => c.isVertex() && c.getType() == type)?.[0];
    }



}

export default Cell;