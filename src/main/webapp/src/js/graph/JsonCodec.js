import mxgraph from '../mxgraph';
const { mxObjectCodec, mxUtils } = mxgraph;

class JsonCodec extends mxObjectCodec {
    constructor() {
        super();
    }
    encode(value) {
        const xmlDoc = mxUtils.createXmlDocument();
        const newObject = xmlDoc.createElement("Object");
        for(let prop in value) {
            newObject.setAttribute(prop, value[prop]);
        }
        return newObject;
    }
    decode(model) {
        return Object.keys(model.cells).map(cellIndex => {
                const currentCell = model.getCell(cellIndex);
                return (currentCell.value !== undefined) ? currentCell : null;
            }
        ).filter(item => item !== null);
    }
}

export default JsonCodec;