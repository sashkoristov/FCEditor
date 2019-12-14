import mxgraph from '../mxgraph';
import { cellStyle } from './styles';

const { mxUtils, mxConstants, mxPerimeter } = mxgraph;

let start = {
    name: 'start',
    style: mxUtils.clone(cellStyle),
    width: 46,
    height: 46,
    ports: {
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH}
    }
};
start.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
start.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
start.style[mxConstants.STYLE_FILLCOLOR] = '#003554';
start.style[mxConstants.STYLE_FONTCOLOR] = '#fff';
start.style[mxConstants.STYLE_STROKECOLOR] = '#051923';


let end = {
    name: 'end',
    style: mxUtils.clone(cellStyle),
    width: 44,
    height: 44,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH}
    }
};
end.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
end.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
end.style[mxConstants.STYLE_FILLCOLOR] = '#ddd';
end.style[mxConstants.STYLE_FONTCOLOR] = '#000';
end.style[mxConstants.STYLE_STROKECOLOR] = '#ccc';
end.style[mxConstants.STYLE_STROKEWIDTH] = 4;

let join = {
    name: 'join',
    style: mxUtils.clone(cellStyle),
    width: 32,
    height: 24,
    ports: {
        ins: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        outs: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    }
};
join.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
join.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
join.style[mxConstants.STYLE_STROKEWIDTH] = 0;

let fn = {
    name: 'fn',
    style: mxUtils.clone(cellStyle),
    width: 100,
    height: 44,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    }
};
fn.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
fn.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
fn.style[mxConstants.STYLE_ROUNDED] = true;


let cond = {
    name: 'cond',
    style: mxUtils.clone(cellStyle),
    width: 70,
    height: 60,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        yes: {x: 0.75, y: 0.75, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
        no: {x: 0.25, y: 0.75, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH}
    }
};
cond.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
cond.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
cond.style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
cond.style[mxConstants.STYLE_SPACING_TOP] = 20;

let multicond = {
    name: 'multicond',
    style: mxUtils.clone(cond.style),
    width: 70,
    height: 60,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        outs: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    }
};
multicond.style[mxConstants.STYLE_FILLCOLOR] = '#660E7A';
multicond.style[mxConstants.STYLE_STROKECOLOR] = '#888';

let container = {
    name: 'container',
    style: mxUtils.clone(cellStyle),
    width: 200,
    height: 300,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_ALL},
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_ALL},
    }
};
container.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
container.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
container.style[mxConstants.STYLE_ROUNDED] = true;
container.style[mxConstants.STYLE_RESIZABLE] = true;
container.style[mxConstants.STYLE_STARTSIZE] = 22;
container.style[mxConstants.STYLE_DASHED] = true;
container.style[mxConstants.STYLE_FONTCOLOR] = 'black';
container.style[mxConstants.STYLE_FONTSIZE] = 14
container.style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
container.style[mxConstants.STYLE_LABEL_POSITION] = mxConstants.ALIGN_LEFT;
container.style[mxConstants.STYLE_SPACING_LEFT] = 160;
container.style[mxConstants.STYLE_SPACING_TOP] = 10;
container.style[mxConstants.STYLE_LABEL_WIDTH] = 100;
container.style[mxConstants.STYLE_STROKECOLOR] = 'black';
container.style[mxConstants.STYLE_SWIMLANE_LINE] = 'none';
container.style[mxConstants.STYLE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';
container.style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';

let port = {
    name: 'port',
    style: mxUtils.clone(cellStyle),
    width: 12,
    height: 12,
};
port.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
port.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
port.style[mxConstants.STYLE_PERIMETER_SPACING] = 6;
port.style[mxConstants.STYLE_FONTSTYLE] = 2;

export { start, end, join, fn, cond, multicond, container, port };