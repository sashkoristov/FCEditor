import React from "react";
import ReactDOM from "react-dom";

import { ButtonGroup, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import mxgraph from '../mxgraph';
const {
    mxClient,
    mxCodec,
    mxConstants,
    mxEvent,
    mxHierarchicalLayout,
    mxKeyHandler,
    mxRubberband,
    mxUtils
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

            // Disables the built-in context menu
            mxEvent.disableContextMenu(container);

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
        graph.setDisconnectOnMove(false);

        // key handler
        const keyHandler = new mxKeyHandler(graph);

        keyHandler.bindKey(46, this._removeSelected);
        keyHandler.bindKey(8, this._removeSelected);

        // Enables rubberband selection
        new mxRubberband(graph);

        // Disables floating connections (only connections via ports allowed)
        graph.connectionHandler.isConnectableCell = cell => { return false; };

        // style
        this._setGraphStyle();

        // constraints
        this._setConstraints();
    };

    _setGraphStyle = () => {
        const { graph } = this.state;

        for (let key in cellDefs) {
            graph.getStylesheet().putCellStyle(cellDefs[key].name, cellDefs[key].style);
        }

        // Specifies the default edge style
        graph.getStylesheet().getDefaultEdgeStyle()[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
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

        // End needs exactly one incoming connection
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, 'End', null, null, 1, 1, null,
                'End must have 1 incoming connection',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, 'End', null, null, 0, 0, null,
                'End must not have outgoing connections',
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
        const { graph } = this.state;
        let parent = graph.getDefaultParent();
        for (let i in parent.children) {
            if (parent.children[i].style == cellDefs.start.name) {
                mxUtils.alert('Already a start cell in graph!');
                return;
            }
        }
        this._addCell('Start', cellDefs.start);
    };

    _addEnd = () => {
        const { graph } = this.state;
        let parent = graph.getDefaultParent();
        for (let i in parent.children) {
            if (parent.children[i].style == cellDefs.end.name) {
                mxUtils.alert('Already an end cell in graph!');
                return;
            }
        }
        this._addCell('End', cellDefs.end);
    };

    _addMerge = () => {
        this._addCell(null, cellDefs.merge);
    };

    _addFn = (type) => {
        this._addCell(
            new afcl.functions.AtomicFunction(type),
            cellDefs.fn
        );
    };

    _addIfThenElse = () => {
        this._addCell(
            new afcl.functions.IfThenElse('IfThenElse'),
            cellDefs.cond
        );
    };

    _addSwitch = () => {
        this._addCell(
            new afcl.functions.Switch('Switch'),
            cellDefs.multicond
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

    _applyLayout = () => {
        const {graph} = this.state;

        var layout = new mxHierarchicalLayout(graph);
        layout.execute(graph.getDefaultParent());
    };

    _exportXml = () => {
        const {graph} = this.state;

        var enc = new mxCodec(mxUtils.createXmlDocument());
        var node = enc.encode(graph.getModel());

        console.log(mxUtils.getXml(node));
    };

    render() {
        return <div className="animated fadeIn">
            <ButtonGroup>
                <Button onClick={this._addStart}>Start</Button>
                <Button onClick={this._addEnd}>End</Button>
                <Button onClick={this._addMerge}>Merge</Button>
                <UncontrolledButtonDropdown>
                    <DropdownToggle caret>
                        Function
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => this._addFn('Fn 1')}>Fn 1</DropdownItem>
                        <DropdownItem onClick={() => this._addFn('Fn 2')}>Fn 2</DropdownItem>
                        <DropdownItem onClick={() => this._addFn('Fn xy')}>Fn xy</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem>Add Function ...</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Button onClick={this._addIfThenElse}>If-Then-Else</Button>
                <Button onClick={this._addSwitch}>Switch</Button>
                <UncontrolledButtonDropdown>
                    <DropdownToggle caret>
                        Compound Parallel
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this._addParallel}>Parallel</DropdownItem>
                        <DropdownItem onClick={this._addParallelFor}>ParallelFor</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Button onClick={this._exportXml}>Export XML</Button>
                <Button onClick={this._applyLayout}>Apply Layout</Button>
            </ButtonGroup>
            <div className="graph-wrapper">
                <div id="graph" className="graph" ref="graphContainer"/>
            </div>
        </div>
    }

}

export default WorkflowEditor;