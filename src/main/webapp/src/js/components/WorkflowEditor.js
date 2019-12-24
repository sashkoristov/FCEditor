/**
 * Workflow Editor Component
 *
 * @author Ben Walch, 2018-2019
 */
import React from "react";
import ReactDOM from "react-dom";

import {ButtonGroup, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';

import mxgraph from '../mxgraph';

const {
    mxClient,
    mxCodec,
    mxCellState,
    mxConstants,
    mxEvent,
    mxHierarchicalLayout,
    mxKeyHandler,
    mxEdgeHandler,
    mxRubberband,
    mxUtils,
    mxPoint,
    mxImage
} = mxgraph;

import pointImg from '../../assets/images/point.svg';
import checkImg from '../../assets/images/check.svg';
import cancelImg from '../../assets/images/cancel.svg';

import * as afcl from '../afcl/';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph';
import {cellStyle, edgeStyle} from '../graph/styles';
import axios from "axios";

import FuntionsContext, {FunctionsContextProvider} from '../context/FunctionsContext';

/**
 * Workflow Editor Component
 */
class WorkflowEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {},
            workflow: {
                name: 'Untitled'
            }
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
        const {graph} = this.state;

        graph.gridSize = 4;
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

        // Enables Guides
        graph.graphHandler.guidesEnabled = true;

        //
        graph.connectionHandler.movePreviewAway = false;

        mxEdgeHandler.prototype.isConnectableCell = cell => {
            return graph.connectionHandler.isConnectableCell(cell);
        };

        // Disables existing port functionality
        graph.view.getTerminalPort = (state, terminal, source) => {
            return terminal;
        };

        graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
            var edge = evt.getProperty('cell');

            this._onCellConnected(edge, edge.source, edge.target);
        });

        // sets the port image
        graph.connectionHandler.constraintHandler.pointImage = new mxImage(pointImg, 16, 16);

        // gets the respecitve port image
        graph.connectionHandler.constraintHandler.getImageForConstraint = (state, constraint, point) => {
            switch (constraint.id) {
                case 'then':
                    return new mxImage(checkImg, 16, 16);
                case 'else':
                    return new mxImage(cancelImg, 16, 16);
                default:
                    return graph.connectionHandler.constraintHandler.pointImage;
            }
            return graph.connectionHandler.constraintHandler.pointImage;
        };

        // style
        this._setGraphStyle();

        // constraints
        this._setConstraints();
    };

    _setGraphStyle = () => {
        const {graph} = this.state;

        // Specifies the default cell style
        graph.getStylesheet().putDefaultVertexStyle(cellStyle)

        // Specifies the default edge style
        graph.getStylesheet().putDefaultEdgeStyle(edgeStyle);

        for (let key in cellDefs) {
            graph.getStylesheet().putCellStyle(cellDefs[key].name, cellDefs[key].style);
        }
    };

    _setConstraints = () => {
        const {graph} = this.state;

        // Start must not have incomming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, cellDefs.start.name, null, null, 0, 0, null,
                'Start must not have incoming connections',
            )
        );
        // Start needs exactly one outcoming connection
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, cellDefs.start.name, null, null, 1, 1, null,
                'Start must have exactly one outgoing connection',
            )
        );

        // End needs exactly one incoming connection
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, cellDefs.end.name, null, null, 1, 1, null,
                'End must have exactly one incoming connection',
            )
        );
        // End must not have outgoing connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, cellDefs.end.name, null, null, 0, 0, null,
                'End must not have outgoing connections',
            )
        );

        // Functions need exactly one incoming/outcoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.AtomicFunction, null, null, 1, 1, null,
                'Atomic functions must have exactly 1 incoming connection',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.AtomicFunction, null, null, 1, 1, null,
                'Atomic functions must have exactly 1 outgoing connection',
            )
        );

        // Compound Parallel need exactly one incoming and one outcoming connection
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.Parallel, null, null, 1, 1, null,
                'Parallel functions must have exactly 1 incoming connection',
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.Parallel, null, null, 1, 1, null,
                'Parallel functions must have exactly 1 outgoing connection',
            )
        );

        // If-then-else need exactly one incoming/two outcoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, afcl.functions.IfThenElse, null, null, 1, 1, null,
                'If-Then-Else must have exactly 1 incoming connection'
            )
        );
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, afcl.functions.IfThenElse, null, null, 2, 2, null,
                'If-Then-Else must have exactly 2 outgoing connections'
            )
        );

        // merge must have exactly one outgoing
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, cellDefs.merge.name, null, null, 1, 1, null,
                'Merge must have exactly 1 outgoing connection'
            )
        );

        // fork must not have incoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                false, cellDefs.fork.name, null, null, 0, 0, null, 'Fork must not have incoming connections'
            )
        );

        // join must not have incoming connections
        graph.multiplicities.push(
            new mxGraphOverrides.Multiplicity(
                true, cellDefs.join.name, null, null, 0, 0, null, 'Join must not have outgoing connections'
            )
        );
    };

    _onCellConnected = (edge, source, target) => {
        const {graph} = this.state;

        // connection comes from switch - set a case label
        if (source.value instanceof afcl.functions.Switch) {
            edge.setValue('Case [...]');
        }

        if (source.value instanceof afcl.functions.IfThenElse) {
            let style = graph.getCellStyle(edge);
            if (style[mxConstants.STYLE_SOURCE_PORT] == 'then') {
                edge.setValue('then');
                edge.setStyle(mxUtils.setStyle(edge.style, mxConstants.STYLE_STROKECOLOR, mxConstants.VALID_COLOR));
            }
            if (style[mxConstants.STYLE_SOURCE_PORT] == 'else') {
                edge.setValue('else');
                edge.setStyle(mxUtils.setStyle(edge.style, mxConstants.STYLE_STROKECOLOR, mxConstants.INVALID_COLOR));
            }
        }
    };

    _addStart = () => {
        const {graph} = this.state;
        let parent = graph.getDefaultParent();
        for (let i in parent.children) {
            if (parent.children[i].type && parent.children[i].type === cellDefs.start.name) {
                mxUtils.alert('Already a start cell in graph!');
                return;
            }
        }
        this._addCell('Start', cellDefs.start);
    };

    _addEnd = () => {
        const {graph} = this.state;
        let parent = graph.getDefaultParent();
        for (let i in parent.children) {
            if (parent.children[i].type && parent.children[i].type === cellDefs.end.name) {
                mxUtils.alert('Already an end cell in graph!');
                return;
            }
        }
        this._addCell('End', cellDefs.end);
    };

    _addMerge = () => {
        this._addCell('merge', cellDefs.merge);
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
            let v = graph.insertVertex(parent, null, userObj, 20, 20, cell.width ?? 80, cell.height ?? 40, cell.name);
            v.setType(cell.name);

            // add sub cells, if any
            if (cellDefs.container.subCells) {
                for (let subCell in cell.subCells) {
                    let subV = graph.insertVertex(
                        v,
                        null,
                        subCell,
                        cell.subCells[subCell].x,
                        cell.subCells[subCell].y,
                        cellDefs[subCell].width,
                        cellDefs[subCell].height,
                        cellDefs[subCell].name,
                        cell.subCells[subCell].relative
                    );
                    subV.getGeometry().offset = cell.subCells[subCell].offset;
                    subV.setType(cellDefs[subCell].name);
                }
            }
        } finally {
            // Updates the display
            graph.getModel().endUpdate();
        }
    };

    _removeSelected = () => {
        const {graph} = this.state;
        graph.isEnabled() && graph.removeCells();
    };

    _showXml = () => {
        const {graph} = this.state;

        if (graph.isEmpty()) {
            return;
        }
        const enc = new mxCodec(mxUtils.createXmlDocument());
        const xmlModel = enc.encode(graph.getModel());

        mxUtils.popup(mxUtils.getPrettyXml(xmlModel), true);

    };

    _validateGraph = () => {
        const {graph} = this.state;
        graph.validateGraph();
    };

    _saveWorkflow = () => {
        const { graph } = this.state;

        const workflowName = mxUtils.prompt('Save as ...', this.state.workflow.name);

        if (workflowName != '') {
            // axios.post
        }

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
                <Button onClick={this._validateGraph}>Validate Graph</Button>
                <Button onClick={this._saveWorkflow}>Save</Button>
            </ButtonGroup>
            <div className="graph-wrapper">
                <div id="graph" className="graph" ref="graphContainer"/>
            </div>
        </div>
    }

}

export default WorkflowEditor;