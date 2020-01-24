/**
 * custom implementation of class 'mxCodec'
 *
 * @author Ben Walch, 2019-2020
 */
import mxgraph from '../../mxgraph';

import * as afcl from '../../afcl';

const { mxCodec, mxCodecRegistry, mxConstants } = mxgraph;

class Codec extends mxCodec {

    decode(node, into) {

        this.updateElements();
        var obj = null;

        if (node != null && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
            var ctor = null;

            try
            {
                ctor = afcl.functions[node.nodeName] ?? afcl.objects[node.nodeName];
            }
            catch (err)
            {
                console.log(err);
                // ignore
            }

            if (ctor != null) {

                var dec = mxCodecRegistry.getCodec(ctor);

                if (dec != null) {
                    obj = dec.decode(this, node, into);
                } else {
                    obj = node.cloneNode(true);
                    obj.removeAttribute('as');
                }
            }
        }

        return obj || super.decode(node, into);
    }
}

export default Codec;