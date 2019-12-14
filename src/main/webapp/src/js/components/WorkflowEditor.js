import React from "react";
import ReactDOM from "react-dom";

import { ButtonGroup, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import mxgraph from '../mxgraph';
const {
    mxClient,
    mxCodec,
    mxCellState,
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
import * as utils from '../utils/';
import { edgeStyle } from '../graph/styles';
import axios from "axios";

import FuntionsContext, {FunctionsContextProvider} from '../context/FunctionsContext';

class WorkflowEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {}
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
        graph.setPortsEnabled(false);

        // key handler
        const keyHandler = new mxKeyHandler(graph);

        keyHandler.bindKey(46, this._removeSelected);
        keyHandler.bindKey(8, this._removeSelected);

        // Enables rubberband selection
        new mxRubberband(graph);

        // Disables floating connections (only connections via ports allowed)
        graph.connectionHandler.isConnectableCell = cell => { return false; };

        graph.connectionHandler.createEdgeState = (me) => {
            var edge = graph.createEdge(null, null, null, null, null);
            return new mxCellState(graph.view, edge, graph.getCellStyle(edge));
        };

        graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
            var edge = evt.getProperty('cell');
            var source = graph.getModel().getTerminal(edge, true);
            var target = graph.getModel().getTerminal(edge, false);

            this._onCellConnected(edge, source, target);
        });

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
        graph.getStylesheet().putDefaultEdgeStyle(edgeStyle);
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

        // Compound Parallel need exactly one incoming and one outcoming connections at each port
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.Parallel, null, null, 1, 1, null,
                'Parallel functions must have 1 incoming connection',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.Parallel, null, null, 1, 1, null,
                'Parallel functions must have 1 outgoing connection',
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

    _onCellConnected = (edge, source, target) => {
        const { graph } = this.state;

        // connection comes from switch - set a case label
        if (source.value instanceof afcl.functions.Switch) {
            edge.setValue('Case ...');
        }

        if (source.value instanceof afcl.functions.IfThenElse) {
            let style = graph.getCellStyle(edge);
            if (style[mxConstants.STYLE_SOURCE_PORT] == 'yes') {
                edge.setValue('Yes');
            }
            if (style[mxConstants.STYLE_SOURCE_PORT] == 'no') {
                edge.setValue('No');
            }
        }
    };

    _addStart = () => {
        const { graph } = this.state;
        let parent = graph.getDefaultParent();
        for (let i in parent.children) {
            if (parent.children[i].style === cellDefs.start.name) {
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
            if (parent.children[i].style === cellDefs.end.name) {
                mxUtils.alert('Already an end cell in graph!');
                return;
            }
        }
        this._addCell('End', cellDefs.end);
    };

    _addJoin = () => {
        this._addCell(null, cellDefs.join);
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

    _showXml = () => {
        const {graph} = this.state;

        const enc = new mxCodec(mxUtils.createXmlDocument());
        const xmlModel = enc.encode(graph.getModel());

        mxUtils.popup(mxUtils.getPrettyXml(xmlModel), true);

    };

    render() {
        return <div className="animated fadeIn">
            <ButtonGroup>
                <Button onClick={this._addStart}>Start</Button>
                <Button onClick={this._addEnd}>End</Button>
                <Button onClick={this._addJoin}>Join</Button>
                <UncontrolledButtonDropdown>
                    <DropdownToggle caret>
                        Function
                    </DropdownToggle>
                    <DropdownMenu>
                        <FuntionsContext.Consumer>
                            {fc => (
                                fc.functions.map(fn => <DropdownItem
                                    onClick={() => this._addFn(fn.name)}>{fn.name}</DropdownItem>)
                            )}
                        </FuntionsContext.Consumer>
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
                <Button onClick={this._showXml}>Show XML</Button>
                <Button onClick={this._applyLayout}>Apply Layout</Button>
            </ButtonGroup>
            <div className="graph-wrapper">
                <div id="graph" className="graph" ref="graphContainer"/>
            </div>
        </div>
    }

}

export default WorkflowEditor;