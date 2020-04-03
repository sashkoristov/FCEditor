
import * as utils from "../../utils";
import * as cellDefs from '../cells';
import * as mxGraphOverrides from '../';

import mxgraph from '../../mxgraph';
const { mxGeometry, mxPoint } = mxgraph;

function generateVertexCell(cellDef, userObj = null) {
    let cell = new mxGraphOverrides.Cell();
    let geometry = new mxGeometry(cellDef.x || 0, cellDef.y || 0, cellDef.width || 80, cellDef.height || 40);

    cell.setVertex(true);
    cell.setEdge(false);
    cell.setStyle(cellDef.name);
    cell.setType(cellDef.type || cellDef.name);

    if (userObj != null) {
        cell.setValue(userObj);
    }

    if (cellDef.offset) {
        geometry.offset = new mxPoint(cellDef.offset.x, cellDef.offset.y);
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
    edge.setGeometry(new mxGeometry());
    edge.setEdge(true);
    edge.setVertex(false);
    edge.setTerminal(source, true);
    edge.setTerminal(target, false);
    return edge;
}

export { generateVertexCell, generateEdgeCell };