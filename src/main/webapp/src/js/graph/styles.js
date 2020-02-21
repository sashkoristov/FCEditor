/**
 * default cell and edge style definitions
 *
 * @author Ben Walch, 2018-2019
 */
import mxgraph from '../mxgraph';
const { mxConstants, mxEdgeStyle, mxStylesheet } = mxgraph;

const cellStyle = new mxStylesheet().getDefaultVertexStyle();
const edgeStyle = new mxStylesheet().getDefaultEdgeStyle();

cellStyle[mxConstants.STYLE_EDITABLE] = false;
cellStyle[mxConstants.STYLE_RESIZABLE] = false;
cellStyle[mxConstants.STYLE_ROTATABLE] = false;
cellStyle[mxConstants.STYLE_FONTSIZE] = 10;
cellStyle[mxConstants.STYLE_HORIZONTAL] = true;
cellStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = mxConstants.NONE;
cellStyle[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
cellStyle[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
cellStyle[mxConstants.STYLE_FILLCOLOR] = '#0582CA';
cellStyle[mxConstants.STYLE_STROKECOLOR] = '#006494';
cellStyle[mxConstants.STYLE_FONTCOLOR] = '#fff';
cellStyle[mxConstants.STYLE_STROKEWIDTH] = 3;
cellStyle[mxConstants.STYLE_PERIMETER_SPACING] = 4;

edgeStyle[mxConstants.STYLE_ROUNDED] = true;
edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#006494';
edgeStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#fff';
edgeStyle[mxConstants.STYLE_LABEL_PADDING] = '4px';
edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
edgeStyle[mxConstants.STYLE_EDITABLE] = true;
edgeStyle[mxConstants.STYLE_FONTCOLOR] = '#051923';
edgeStyle[mxConstants.STYLE_FONTSIZE] = 12;
edgeStyle[mxConstants.STYLE_FONTSTYLE] = mxConstants.FONT_BOLD;
edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector;

export { cellStyle, edgeStyle };