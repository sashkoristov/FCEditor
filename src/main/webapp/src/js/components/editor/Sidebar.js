import React from 'react';
import ReactDOM from 'react-dom';
import {
    Badge,
    Button,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';

import mxgraph from '../../mxgraph';

const {
    mxCell,
    mxGeometry
} = mxgraph;

import * as mxGraphOverrides from '../../graph';
import * as cellDefs from '../../graph/cells';
import * as afcl from '../../afcl';

import FunctionsContext, {FunctionsContextProvider} from '../../context/FunctionsContext';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._tempGraph = this._createTemporaryGraph();

        ReactDOM.findDOMNode(this.refs._addStartBtn).prepend(this._createThumb(cellDefs.start, 40, 40));
        ReactDOM.findDOMNode(this.refs._addEndBtn).prepend(this._createThumb(cellDefs.end, 40, 40));
        ReactDOM.findDOMNode(this.refs._fnDropdownToggle).prepend(this._createThumb(cellDefs.fn, 48, 28));
        ReactDOM.findDOMNode(this.refs._addIfThenElseBtn).prepend(this._createThumb(cellDefs.cond, 44, 44));
        ReactDOM.findDOMNode(this.refs._addSwitchBtn).prepend(this._createThumb(cellDefs.multicond, 44, 44));
        ReactDOM.findDOMNode(this.refs._addMergeBtn).prepend(this._createThumb(cellDefs.merge, 28, 20));
        ReactDOM.findDOMNode(this.refs._compoundDropdownToggle).prepend(this._createThumb(cellDefs.container, 60, 44));
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

    _createThumb = (cellDef, width, height) => {
        var el = window.document.createElement('div');

        let cell = new mxCell(null, new mxGeometry(0, 0, width, height), cellDef.name);
        cell.vertex = true;
        this._tempGraph.view.scaleAndTranslate(1, 0, 0);
        this._tempGraph.addCell(cell);

        var bounds = this._tempGraph.getGraphBounds();
        var s = Math.floor(Math.min((width - 2) / bounds.width,
            (height - 2) / bounds.height) * 100) / 100;
        this._tempGraph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
            Math.floor((height - bounds.height * s) / 2 / s - bounds.y));

        var node = null;

        node = this._tempGraph.view.getCanvas().ownerSVGElement.cloneNode(true);

        node.style.position = 'relative';
        node.style.overflow = 'hidden';
        node.style.width = width + 'px';
        node.style.height = height + 'px';
        node.style.visibility = '';
        node.style.minWidth = '';
        node.style.minHeight = '';

        this._tempGraph.getModel().clear();

        el.appendChild(node);

        return el;
    };

    render() {
        return <div className="graph-sidebar">
            <Button onClick={this.props.editor._addStart} className="btn-square item" ref="_addStartBtn">Start</Button>
            <Button onClick={this.props.editor._addEnd} className="btn-square item" ref="_addEndBtn">End</Button>
            <UncontrolledDropdown direction="right" className="functions-dropdown">
                <DropdownToggle className="btn-square" ref="_fnDropdownToggle">
                    Function
                </DropdownToggle>
                <DropdownMenu>
                    <FunctionsContext.Consumer>
                        {fc => (
                            fc.functions.map(fn => <DropdownItem key={fn.id}
                                onClick={() => this.props.editor._addFn(fn)}>{fn.name}<Badge>{fn.type}</Badge></DropdownItem>)
                        )}
                    </FunctionsContext.Consumer>
                </DropdownMenu>
            </UncontrolledDropdown>
            <Button onClick={this.props.editor._addIfThenElse} className="btn-square item" ref="_addIfThenElseBtn">If-Then-Else</Button>
            <Button onClick={this.props.editor._addSwitch} className="btn-square item" ref="_addSwitchBtn">Switch</Button>
            <Button onClick={this.props.editor._addMerge} className="btn-square item" ref="_addMergeBtn">Merge</Button>
            <UncontrolledDropdown direction="right" className="item">
                <DropdownToggle className="btn-square" ref="_compoundDropdownToggle">
                    Compound
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => this.props.editor._addParallel()}>Parallel</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._addParallelFor()}>ParallelFor</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
        </div>
    }

}

export default Sidebar;