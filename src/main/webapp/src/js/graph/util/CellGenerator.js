
import * as utils from "../../utils";
import * as cellDefs from '../cells';
import * as mxGraphOverrides from '../';

import mxgraph from '../../mxgraph';
const { mxGeometry } = mxgraph;

function generateVertexCell(cellDef, userObj = null) {
    let cell = new mxGraphOverrides.Cell();
    let geometry = new mxGeometry(cellDef.x || 0, cellDef.y || 0, cellDef.width || 80, cellDef.height || 40);

    cell.setVertex(true);
    cell.setStyle(cellDef.name);
    cell.setType(cellDef.type || cellDef.name);

    if (userObj != null) {
        cell.setValue(userObj);
    }

    if (cellDef.offset) {
        geometry.offset = cellDef.offset;
    }
    if (cellDef.relative) {
        geometry.relative = true;
    }

    cell.setGeometry(geometry);

    // add sub cells, if any
    if (cellDef.subCells) {
        for (let subCell in cellDef.subCells) {
            let subV = generateVertexCell({...cellDefs[subCell], ...cellDef.subCells[subCell], relative: true});
            cell.insert(subV);
        }
    }

    return cell;
}

function generateEdgeCell(source, target) {
    let edge = new mxGraphOverrides.Cell();
    let geometry = new mxGeometry();
    geometry.relative = true;
    edge.setGeometry(geometry);
    edge.setEdge(true);
    edge.source = source;
    edge.target = target;
    return edge;
}

export { generateVertexCell, generateEdgeCell };