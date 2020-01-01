/**
 * Custom cell definitions and constants
 *
 * @author Ben Walch, 2018-2019
 */
import mxgraph from '../mxgraph';
import { cellStyle } from './styles';

import * as afcl from '../afcl';

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

let merge = {
    name: 'merge',
    style: mxUtils.clone(cellStyle),
    width: 40,
    height: 28,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    }
};
merge.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
merge.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
merge.style[mxConstants.STYLE_STROKEWIDTH] = 4;

let fn = {
    name: 'fn',
    type: mxUtils.getFunctionName(afcl.functions.AtomicFunction),
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
    type: mxUtils.getFunctionName(afcl.functions.IfThenElse),
    style: mxUtils.clone(cellStyle),
    width: 70,
    height: 60,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        then: {x: 0.75, y: 0.75, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
        else: {x: 0.25, y: 0.75, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH}
    }
};
cond.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
cond.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
cond.style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
cond.style[mxConstants.STYLE_SPACING_TOP] = 20;

let multicond = {
    name: 'multicond',
    type: mxUtils.getFunctionName(afcl.functions.Switch),
    style: mxUtils.clone(cond.style),
    width: 70,
    height: 60,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    }
};
multicond.style[mxConstants.STYLE_FILLCOLOR] = '#660E7A';
multicond.style[mxConstants.STYLE_STROKECOLOR] = '#888';

let fork = {
    name: 'fork',
    style: mxUtils.clone(cellStyle),
    width: 54,
    height: 6
};
fork.style[mxConstants.STYLE_FILLCOLOR] = '#000';
fork.style[mxConstants.STYLE_STROKEWIDTH] = 0;
fork.style[mxConstants.STYLE_PERIMETER_SPACING] = 2;

let join = mxUtils.clone(fork);
join.name = 'join';

let container = {
    name: 'container',
    style: mxUtils.clone(cellStyle),
    width: 200,
    height: 300,
    ports: {
        in: {x: 0.5, y: 0, perimeter: true, constraint: mxConstants.DIRECTION_MASK_NORTH},
        out: {x: 0.5, y: 1, perimeter: true, constraint: mxConstants.DIRECTION_MASK_SOUTH},
    },
    subCells: {
        fork: {x: 0.5, y: 0.025, offset: {x: -fork.width/2, y: 0}, style: fork.name},
        join: {x: 0.5, y: 0.975, offset: {x: -join.width/2, y: -join.height}, style: join.name}
    }
};
container.style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
container.style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
container.style[mxConstants.STYLE_ROUNDED] = true;
container.style[mxConstants.STYLE_RESIZABLE] = true;
container.style[mxConstants.STYLE_STARTSIZE] = 22;
container.style[mxConstants.STYLE_DASHED] = true;
container.style[mxConstants.STYLE_FONTCOLOR] = 'black';
container.style[mxConstants.STYLE_FONTSIZE] = 14;
container.style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
container.style[mxConstants.STYLE_LABEL_POSITION] = mxConstants.ALIGN_LEFT;
container.style[mxConstants.STYLE_SPACING_TOP] = 10;
container.style[mxConstants.STYLE_LABEL_WIDTH] = 100;
container.style[mxConstants.STYLE_STROKECOLOR] = 'black';
container.style[mxConstants.STYLE_SWIMLANE_LINE] = 'none';
container.style[mxConstants.STYLE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';
container.style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = 'rgba(255, 255, 255, .5)';

let parallel = mxUtils.clone(container);
parallel.name = 'parallel';
parallel.type = mxUtils.getFunctionName(afcl.functions.Parallel);
parallel.style[mxConstants.STYLE_SPACING_LEFT] = 160;

let parallelFor = mxUtils.clone(container);
parallelFor.name = 'parallelFor';
parallelFor.type = mxUtils.getFunctionName(afcl.functions.ParallelFor);
parallelFor.style[mxConstants.STYLE_SPACING_LEFT] = 180;

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

export {
    start,
    end,
    merge,
    fn,
    cond,
    multicond,
    parallel,
    parallelFor,
    fork,
    join,
    port
};