import * as mx from 'mxgraph';

// do not load mxgraph specific resources
window.mxLoadResources = false;
//window.mxLoadStylesheets = false;

const mxgraph = mx({
    mxBasePath: 'dist/mxgraph'
});

// decode bug https://github.com/jgraph/mxgraph/issues/49
window.mxGraph = mxgraph.mxGraph;
window.mxGraphModel = mxgraph.mxGraphModel;
window.mxCell = mxgraph.mxCell;
window.mxGeometry = mxgraph.mxGeometry;
window.mxPoint = mxgraph.mxPoint;
window.mxDefaultKeyHandler = mxgraph.mxDefaultKeyHandler;
window.mxDefaultPopupMenu = mxgraph.mxDefaultPopupMenu;
window.mxStylesheet = mxgraph.mxStylesheet;
window.mxDefaultToolbar = mxgraph.mxDefaultToolbar;

export default mxgraph;