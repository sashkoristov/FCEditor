import React from "react";
import ReactDOM from "react-dom";

import mxgraph from '../mxgraph';

const {
    mxClient,
    mxConstants,
    mxGraph,
    mxUtils,
    mxRubberband,
    mxKeyHandler,
    mxPerimeter
} = mxgraph;


class GraphEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {},
        };
    }

    componentDidMount() {
        this._createGraph();
    }

    _createGraph = () => {

        // Checks if the browser is supported
        if (!mxClient.isBrowserSupported()) {
            mxUtils.error('Browser is not supported!', 200, false);
        } else {
            const container = ReactDOM.findDOMNode(this.refs.graphContainer);

            // Creates the graph inside the given container
            var graph = new mxGraph(container);
        }

        this.setState({
            graph: graph
        }, () => {
            this._configureGraph();
            this._initToolbar();
        });
    };

    _configureGraph = () => {
        const {graph} = this.state;

        graph.gridSize = 30;
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.setConnectable(true);
        graph.setCellsEditable(true);
        graph.setEnabled(true);
        graph.setHtmlLabels(true);
        graph.centerZoom = true;

        // key handler
        const keyHandler = new mxKeyHandler(graph);

        keyHandler.bindKey(46, this._removeSelected);
        keyHandler.bindKey(8, this._removeSelected);

        // Enables rubberband selection
        new mxRubberband(graph);

        // style
        this._setGraphStyle();

        graph.setDropEnabled(true);
        graph.setSplitEnabled(false);

    };

    _setGraphStyle = () => {
        const { graph } = this.state;
        const defaultVertexStyle = graph.getStylesheet().getDefaultVertexStyle();
        //delete defaultVertexStyle[mxConstants.STYLE_FILLCOLOR];

        let style = mxUtils.clone(defaultVertexStyle);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_FONTSIZE] = 10;
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_HORIZONTAL] = true;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
        graph.getStylesheet().putCellStyle('function', style);

        style = mxUtils.clone(defaultVertexStyle);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter;
        style[mxConstants.STYLE_FONTSIZE] = 10;
        style[mxConstants.STYLE_HORIZONTAL] = true;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
        style[mxConstants.STYLE_SPACING_TOP] = 40;
        style[mxConstants.STYLE_SPACING_RIGHT] = 64;
        graph.getStylesheet().putCellStyle('condition', style);

        style = mxUtils.clone(defaultVertexStyle);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
        style[mxConstants.STYLE_FONTSIZE] = 11;
        style[mxConstants.STYLE_STARTSIZE] = 22;
        style[mxConstants.STYLE_HORIZONTAL] = true;
        style[mxConstants.STYLE_FONTCOLOR] = 'black';
        style[mxConstants.STYLE_STROKECOLOR] = 'black';
        graph.getStylesheet().putCellStyle('parallelFor', style);
    };

    _initToolbar = () => {
        const {graph} = this.state;
        const toolbar = ReactDOM.findDOMNode(this.refs.toolbar);
        toolbar.appendChild(
            mxUtils.button("zoom(+)", () => {
                graph.zoomIn();
            })
        );
        toolbar.appendChild(
            mxUtils.button("zoom(-)", () => {
                graph.zoomOut();
            })
        );
        toolbar.appendChild(
            mxUtils.button("zoom(100)", () => {
                graph.zoomTo(1);
            })
        );
        toolbar.appendChild(
            mxUtils.button("add Fn", this._addFn)
        );
        toolbar.appendChild(
            mxUtils.button("add If", this._addIf)
        );
        toolbar.appendChild(
            mxUtils.button("add Loop", this._addLoop)
        );
        toolbar.appendChild(
            mxUtils.button("remove", this._removeSelected)
        );
    };

    _addFn = () => {
        this._addVertex('Fn', 'function');
    };

    _addIf = () => {
        this._addVertex('If', 'condition');
    };

    _addLoop = () => {
        this._addVertex('Loop', 'parallelFor');
    };

    _addVertex = (label, style) => {

        const {graph} = this.state;

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            graph.insertVertex(parent, null, label, 20, 20, 80, 30, style);
        } finally {
            // Updates the display
            graph.getModel().endUpdate();
        }
    };

    _removeSelected = () => {
        const {graph} = this.state;
        graph.isEnabled() && graph.removeCells();
    };

    render() {
        return <div>
            <div className="toolbar" ref="toolbar"></div>
            <div className="graph-wrapper">
                <div id="graph" className="graph" ref="graphContainer"/>
            </div>
        </div>
    }

}

export default GraphEditor;