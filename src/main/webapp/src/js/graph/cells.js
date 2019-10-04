import mxgraph from '../mxgraph';
const { mxUtils, mxConstants, mxPerimeter, mxStylesheet } = mxgraph;

const stylesheet = new mxStylesheet();

let start = {
    name: 'start',
    style: mxUtils.clone(stylesheet.getDefaultVertexStyle()),
    width: 42,
    height: 42
};
start.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
start.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
start.style[mxConstants.STYLE_FONTSIZE] = 10;
start.style[mxConstants.STYLE_HORIZONTAL] = true;
start.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
start.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
start.style[mxConstants.STYLE_FILLCOLOR] = '#333';
start.style[mxConstants.STYLE_FONTCOLOR] = '#fff';
start.style[mxConstants.STYLE_STROKECOLOR] = '#888';
start.style[mxConstants.STYLE_STROKEWIDTH] = 4;
start.style[mxConstants.STYLE_RESIZABLE] = false;
start.style[mxConstants.STYLE_ROTATABLE] = false;
start.style[mxConstants.STYLE_EDITABLE] = false;

let fn = {
    name: 'function',
    style: mxUtils.clone(stylesheet.getDefaultVertexStyle()),
    width: 80,
    height: 30
};
fn.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
fn.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
fn.style[mxConstants.STYLE_FONTSIZE] = 10;
fn.style[mxConstants.STYLE_ROUNDED] = true;
fn.style[mxConstants.STYLE_HORIZONTAL] = true;
fn.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
fn.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
fn.style[mxConstants.STYLE_RESIZABLE] = false;
fn.style[mxConstants.STYLE_ROTATABLE] = false;

let cond = {
    name: 'condition',
    style: mxUtils.clone(stylesheet.getDefaultVertexStyle()),
    width: 60,
    height: 50
};
cond.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
cond.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
cond.style[mxConstants.STYLE_FONTSIZE] = 10;
cond.style[mxConstants.STYLE_HORIZONTAL] = true;
cond.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
cond.style[mxConstants.STYLE_SPACING_TOP] = 40;
cond.style[mxConstants.STYLE_SPACING_RIGHT] = 64;
cond.style[mxConstants.STYLE_RESIZABLE] = false;
cond.style[mxConstants.STYLE_ROTATABLE] = false;

let container = {
    name: 'loop',
    style: mxUtils.clone(stylesheet.getDefaultVertexStyle()),
    width: 200,
    height: 300
};
container.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
container.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
container.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
container.style[mxConstants.STYLE_FONTSIZE] = 11;
container.style[mxConstants.STYLE_ROUNDED] = true;
container.style[mxConstants.STYLE_STARTSIZE] = 22;
container.style[mxConstants.STYLE_HORIZONTAL] = true;
container.style[mxConstants.STYLE_FONTCOLOR] = 'black';
container.style[mxConstants.STYLE_STROKECOLOR] = 'black';
container.style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#fcfcfc';
container.style[mxConstants.STYLE_ROTATABLE] = false;


export { start, fn, cond, container };