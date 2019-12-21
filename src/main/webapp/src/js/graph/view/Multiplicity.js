/**
 * custom implementation of class 'mxMultiplicity'
 *
 * @author Ben Walch, 2018-2019
 */
import mxgraph from "../../mxgraph";

const {
    mxMultiplicity
} = mxgraph;

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

export default Multiplicity;