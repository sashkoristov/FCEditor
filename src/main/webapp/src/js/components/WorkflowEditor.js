import React from "react";
import ReactDOM from "react-dom";

import { ButtonGroup, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import mxgraph from '../mxgraph';
const {
    mxClient,
    mxUtils,
    mxRubberband,
    mxKeyHandler,
} = mxgraph;

import * as afcl from '../afcl/';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph/';

class WorkflowEditor extends React.Component {

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
            var graph = new mxGraphOverrides.Graph(container);
        }

        this.setState({
            graph: graph
        }, () => {
            this._configureGraph();
        });
    };

    _configureGraph = () => {
        const { graph } = this.state;

        graph.gridSize = 30;
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.setConnectable(true);
        graph.setCellsEditable(true);
        graph.setEnabled(true);
        graph.setHtmlLabels(true);
        graph.centerZoom = true;

        graph.setDropEnabled(true);
        graph.setSplitEnabled(false);
        graph.setAllowDanglingEdges(false);
        graph.setMultigraph(false);

        // key handler
        const keyHandler = new mxKeyHandler(graph);

        keyHandler.bindKey(46, this._removeSelected);
        keyHandler.bindKey(8, this._removeSelected);

        // Enables rubberband selection
        new mxRubberband(graph);

        // style
        this._setGraphStyle();

        // constraints
        this._setConstraints();
    };

    _setGraphStyle = () => {
        const { graph } = this.state;

        graph.getStylesheet().putCellStyle(cellDefs.start.name, cellDefs.start.style);
        graph.getStylesheet().putCellStyle(cellDefs.fn.name, cellDefs.fn.style);
        graph.getStylesheet().putCellStyle(cellDefs.cond.name, cellDefs.cond.style);
        graph.getStylesheet().putCellStyle(cellDefs.container.name, cellDefs.container.style);
    };

    _setConstraints = () => {
        const { graph } = this.state;

        // Start needs exactly one outcoming connection
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, 'Start', null, null, 0, 0, null,
                'Start must not have incoming connections',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, 'Start', null, null, 1, 1, null,
                'Start must have 1 outgoing connection',
            )
        );

        // Functions need exactly one incoming/outcoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.AtomicFunction, null, null, 1, 1, null,
                'Atomic functions must have 1 incoming connection',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.AtomicFunction, null, null, 1, 1, null,
                'Atomic functions must have 1 outgoing connection',
            )
        );

        // Conditions need exactly one incoming/two outcoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.IfThenElse, null, null, 1, 1, null,
                'If-Then-Else must have 1 incoming connection'
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.IfThenElse, null, null, 2, 2, null,
                'If-Then-Else must have 2 outgoing connections'
            )
        );
    };

    _addStart = () => {
        this._addCell('Start', cellDefs.start);
    };

    _addFn = () => {
        this._addCell(
            new afcl.functions.AtomicFunction('AtomicFunction'),
            cellDefs.fn
        );
    };

    _addCond = () => {
        this._addCell(
            new afcl.functions.IfThenElse('IfThenElse'),
            cellDefs.cond
        );
    };

    _addParallel = () => {
        this._addCell(
            new afcl.functions.Parallel('Parallel'),
            cellDefs.container
        );
    };


    _addParallelFor = () => {
        this._addCell(
            new afcl.functions.ParallelFor('ParallelFor'),
            cellDefs.container
        );
    };

    _addCell = (userObj, cell) => {
        const {graph} = this.state;

        var parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            graph.insertVertex(parent, null, userObj, 20, 20, cell.width ?? 80, cell.height ?? 40, cell.name);
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
        return <div className="animated fadeIn">
            <ButtonGroup>
                <Button onClick={this._addStart}>Start</Button>
                <Button onClick={this._addFn}>Atomic Function</Button>
                <Button onClick={this._addCond}>If-Then-Else</Button>
                <UncontrolledButtonDropdown>
                    <DropdownToggle caret>
                        Compound Parallel
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this._addParallel}>Parallel</DropdownItem>
                        <DropdownItem onClick={this._addParallelFor}>ParallelFor</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </ButtonGroup>
            <div className="graph-wrapper">
                <div id="graph" className="graph" ref="graphContainer"/>
            </div>
        </div>
    }

}

export default WorkflowEditor;