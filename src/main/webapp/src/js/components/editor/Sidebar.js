import React from 'react';
import ReactDOM from 'react-dom';

import mxgraph from '../../mxgraph';
const {
    mxCell,
    mxConstants,
    mxGeometry,
    mxPerimeter,
    mxUtils
} = mxgraph;

import * as mxGraphOverrides from '../../graph';
import * as cellDefs from '../../graph/cells';


class Sidebar extends React.Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        this._graph = this._createTemporaryGraph();

        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.start));
        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.end));
        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.cond));
        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.multicond));
        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.merge, 30, 30));
        this.refs._sidebarContainer.appendChild(this._createItem(cellDefs.container, 80, 100));
    }

    _createTemporaryGraph() {
        var graph = new mxGraphOverrides.Graph(window.document.createElement('div'));
        for (let key in cellDefs) {
            graph.getStylesheet().putCellStyle(cellDefs[key].name, cellDefs[key].style);
        }
        graph.resetViewOnRootChange = false;
        graph.setConnectable(false);
        graph.gridEnabled = false;
        graph.autoScroll = false;
        graph.setTooltips(false);
        graph.setEnabled(false);

        // Container must be in the DOM for correct HTML rendering
        graph.container.style.visibility = 'hidden';
        graph.container.style.position = 'absolute';
        graph.container.style.overflow = 'hidden';
        graph.container.style.height = '1px';
        graph.container.style.width = '1px';

        //graph.cellRenderer.minSvgStrokeWidth = this.minThumbStrokeWidth;
        //graph.cellRenderer.antiAlias = this.thumbAntiAlias;
        graph.container.style.visibility = 'hidden';
        graph.foldingEnabled = false;

        document.body.appendChild(graph.container);

        return graph;
    }

    _createItem = (cellDef, maxWidth, maxHeight) => {

        maxWidth = maxWidth || 40;
        maxHeight = maxHeight || 40;
        let ratio = 0;

        let width = cellDef.width;
        let height = cellDef.height;

        if (width > maxWidth) {
            ratio = maxWidth / width;
            width = width * ratio;
            height = height * ratio;
        }
        if (height > maxHeight) {
            ratio = maxHeight / height;
            width = width * ratio;
            height = height * ratio;
        }

        var el = window.document.createElement('a');
        el.className = 'geItem';
        el.style.overflow = 'hidden';
        el.style.display = 'block';
        el.onclick = this._handleClick;

        let cell = new mxCell(cellDef.name, new mxGeometry(0, 0, width, height), cellDef.name);
        cell.vertex = true;
        this._graph.view.scaleAndTranslate(1, 0, 0);
        this._graph.addCell(cell);

        var bounds = this._graph.getGraphBounds();
        var s = Math.floor(Math.min((width - 2) / bounds.width,
            (height - 2) / bounds.height) * 100) / 100;
        this._graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
            Math.floor((height - bounds.height * s) / 2 / s - bounds.y));

        var node = null;

        node = this._graph.view.getCanvas().ownerSVGElement.cloneNode(true);

        node.style.position = 'relative';
        node.style.overflow = 'hidden';
        node.style.width = width + 'px';
        node.style.height = height  + 'px';
        node.style.visibility = '';
        node.style.minWidth = '';
        node.style.minHeight = '';

        this._graph.getModel().clear();

        el.appendChild(node);
        return el;
    };

    _handleClick = (e) => {
        alert();
    };

    render() {
        return <div className="graph-toolbar" ref="_sidebarContainer"></div>
    }

}

export default Sidebar;