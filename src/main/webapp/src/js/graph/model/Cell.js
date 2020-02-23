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
     * @param string type
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

}

export default Cell;