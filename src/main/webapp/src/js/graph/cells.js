import mxgraph from '../mxgraph';
const { mxUtils, mxConstants, mxPerimeter, mxStylesheet, mxConnectionConstraint, mxPoint } = mxgraph;

const defaultStyle = new mxStylesheet().getDefaultVertexStyle();

defaultStyle[mxConstants.STYLE_EDITABLE] = false;
defaultStyle[mxConstants.STYLE_RESIZABLE] = false;
defaultStyle[mxConstants.STYLE_ROTATABLE] = false;
defaultStyle[mxConstants.STYLE_FONTSIZE] = 10;
defaultStyle[mxConstants.STYLE_HORIZONTAL] = true;
defaultStyle[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
defaultStyle[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';

let start = {
    name: 'start',
    style: mxUtils.clone(defaultStyle),
    width: 42,
    height: 42,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 1), true)
    ]
};
start.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
start.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
start.style[mxConstants.STYLE_FILLCOLOR] = '#333';
start.style[mxConstants.STYLE_FONTCOLOR] = '#fff';
start.style[mxConstants.STYLE_STROKECOLOR] = '#888';
start.style[mxConstants.STYLE_STROKEWIDTH] = 4;

let end = {
    name: 'end',
    style: mxUtils.clone(defaultStyle),
    width: 42,
    height: 42,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true)
    ]
};
end.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
end.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
end.style[mxConstants.STYLE_FILLCOLOR] = '#ddd';
end.style[mxConstants.STYLE_FONTCOLOR] = '#000';
end.style[mxConstants.STYLE_STROKECOLOR] = '#ccc';
end.style[mxConstants.STYLE_STROKEWIDTH] = 4;

let merge = {
    name: 'merge',
    style: mxUtils.clone(defaultStyle),
    width: 32,
    height: 24,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.5, 1), true)
    ]
};
merge.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_HEXAGON;
merge.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.HexagonPerimeter;
merge.style[mxConstants.STYLE_STROKEWIDTH] = 0;



let fn = {
    name: 'fn',
    style: mxUtils.clone(defaultStyle),
    width: 80,
    height: 30,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.5, 1), true)
    ]
};
fn.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
fn.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
//fn.style[mxConstants.STYLE_ROUNDED] = true;


let cond = {
    name: 'cond',
    style: mxUtils.clone(defaultStyle),
    width: 60,
    height: 50,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.75, 0.75), true),
        new mxConnectionConstraint(new mxPoint(0.25, 0.75), true)
    ]
};
cond.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
cond.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
cond.style[mxConstants.STYLE_FONTSIZE] = 10;
cond.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
cond.style[mxConstants.STYLE_SPACING_TOP] = 16;

let multicond = {
    name: 'multicond',
    style: mxUtils.clone(defaultStyle),
    width: 60,
    height: 50,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.5, 1), true)
    ]
};
multicond.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
multicond.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
multicond.style[mxConstants.STYLE_FONTSIZE] = 10;
multicond.style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
multicond.style[mxConstants.STYLE_FILLCOLOR] = '#660E7A';
multicond.style[mxConstants.STYLE_FONTCOLOR] = '#fff';
multicond.style[mxConstants.STYLE_STROKECOLOR] = '#888';
multicond.style[mxConstants.STYLE_SPACING_TOP] = 16;

let container = {
    name: 'container',
    style: mxUtils.clone(defaultStyle),
    width: 200,
    height: 300,
    connectionConstraints: [
        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
        new mxConnectionConstraint(new mxPoint(0.5, 1), true)
    ]
};
container.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
container.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
container.style[mxConstants.STYLE_FONTSIZE] = 11;
container.style[mxConstants.STYLE_ROUNDED] = true;
container.style[mxConstants.STYLE_RESIZABLE] = true;
container.style[mxConstants.STYLE_STARTSIZE] = 22;
container.style[mxConstants.STYLE_DASHED] = true;
container.style[mxConstants.STYLE_FONTCOLOR] = 'black';
container.style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
container.style[mxConstants.STYLE_LABEL_POSITION] = mxConstants.ALIGN_LEFT;
container.style[mxConstants.STYLE_SPACING_LEFT] = 160;
container.style[mxConstants.STYLE_SPACING_TOP] = 10;
container.style[mxConstants.STYLE_LABEL_WIDTH] = 100;
container.style[mxConstants.STYLE_STROKECOLOR] = 'black';
container.style[mxConstants.STYLE_SWIMLANE_LINE] = 'none';
container.style[mxConstants.STYLE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';
container.style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';

export { start, end, merge, fn, cond, multicond, container };