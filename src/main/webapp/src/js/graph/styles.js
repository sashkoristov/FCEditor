import mxgraph from '../mxgraph';
const { mxConstants, mxPerimeter, mxStylesheet } = mxgraph;

const cellStyle = new mxStylesheet().getDefaultVertexStyle();
const edgeStyle = new mxStylesheet().getDefaultEdgeStyle();

cellStyle[mxConstants.STYLE_EDITABLE] = false;
cellStyle[mxConstants.STYLE_RESIZABLE] = false;
cellStyle[mxConstants.STYLE_ROTATABLE] = false;
cellStyle[mxConstants.STYLE_FONTSIZE] = 12;
cellStyle[mxConstants.STYLE_HORIZONTAL] = true;
cellStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = mxConstants.NONE;
cellStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
cellStyle[mxConstants.STYLE_FILLCOLOR] = '#0582CA';
cellStyle[mxConstants.STYLE_STROKECOLOR] = '#006494';
cellStyle[mxConstants.STYLE_FONTCOLOR] = '#fff';
cellStyle[mxConstants.STYLE_STROKEWIDTH] = 4;

edgeStyle[mxConstants.STYLE_ROUNDED] = true;
edgeStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#fff';
edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
edgeStyle[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;

export { cellStyle, edgeStyle };