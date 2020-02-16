/**
 * Workflow Editor Component
 *
 * @author Ben Walch, 2019-2020
 */

import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";

import {
    Row,
    Col,
    Card, CardHeader, CardBody, CardText, CardLink,
    ButtonGroup,
    Button,
    Badge,
    Modal,
    ModalHeader,
    ModalBody,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Spinner
} from 'reactstrap';

import FileSaver from 'file-saver';

import mxgraph from '../mxgraph';
const {
    mxCell,
    mxClient,
    mxCodec,
    mxCodecRegistry,
    mxObjectCodec,
    mxCellState,
    mxConstants,
    mxEvent,
    mxHierarchicalLayout,
    mxKeyHandler,
    mxEdgeHandler,
    mxRubberband,
    mxUtils,
    mxPerimeter,
    mxShape,
    mxImage
} = mxgraph;

import pointImg from '../../assets/images/point.svg';
import checkImg from '../../assets/images/check.svg';
import cancelImg from '../../assets/images/cancel.svg';

import WorkflowUploadForm from './WorkflowUploadForm';
import FileUpload from './FileUpload';

import * as afcl from '../afcl/';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph';
import {cellStyle, edgeStyle} from '../graph/styles';

import FuntionsContext, {FunctionsContextProvider} from '../context/FunctionsContext';

import Sidebar from './editor/Sidebar';
import WorkflowProperties from './editor/WorkflowProperties';
import CellProperties from './editor/CellProperties';
import AtomicFunctionProperties from './editor/AtomicFunctionProperties';
import IfThenElseProperties from './editor/IfThenElseProperties';
import SwitchProperties from './editor/SwitchProperties';
import ParallelProperties from './editor/ParallelProperties';
import ParallelForProperties from './editor/ParallelForProperties';

/**
 * Workflow Editor Component
 */
class WorkflowEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {},
            selectedCell: null,
            workflow: new afcl.Workflow('Untitled'),
            isLoading: false
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
            const container = this.refs._graphContainer;

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

        // on select callback
        graph.selectionCellsHandler.addListener(mxEvent.ADD, (sender, evt) => {
            this._onCellSelectionChange();
        });
        graph.selectionCellsHandler.addListener(mxEvent.REMOVE, (sender, evt) => {
            this._onCellSelectionChange();
        });

        // on connect callback
        graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
            var edge = evt.getProperty('cell');

            this._onCellConnected(edge, edge.source, edge.target);
        });

        // sets the port image
        graph.connectionHandler.constraintHandler.pointImage = new mxImage(pointImg, 16, 16);

        // gets the respective port image
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

        // I/O (https://jgraph.github.io/mxgraph/docs/js-api/files/io/mxCellCodec-js.html)
        mxCodecRegistry.getCodec(mxCell).template = new mxGraphOverrides.Cell();
        mxCodecRegistry.addAlias(mxUtils.getFunctionName(mxGraphOverrides.Cell), mxUtils.getFunctionName(mxCell));

        // style
        this._setGraphStyle();

        // constraints
        this._setGraphConstraints();
    };

    _setGraphStyle = () => {
        const {graph} = this.state;

        // Specifies the default cell style
        graph.getStylesheet().putDefaultVertexStyle(cellStyle);

        // Specifies the default edge style
        graph.getStylesheet().putDefaultEdgeStyle(edgeStyle);

        for (let key in cellDefs) {
            graph.getStylesheet().putCellStyle(cellDefs[key].name, cellDefs[key].style);
        }
    };

    _setGraphConstraints = () => {
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

    _onCellSelectionChange = () => {
        const { graph } = this.state;
        let selectedCells = graph.getSelectionCells();
        if (selectedCells.length == 1) {
            if (this.state.selectedCell != selectedCells[0]) {
                this._onCellSelected(selectedCells[0]);
            }
        } else {
            this._onCellSelected(null);
        }
    }

    _onCellSelected = (cell) => {
        this.setState({
            selectedCell: cell
        });
    }

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
            }
            if (style[mxConstants.STYLE_SOURCE_PORT] == 'else') {
                edge.setValue('else');
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

    _addFn = (fnObj) => {
        this._addCell(
            new afcl.functions.AtomicFunction(fnObj.name, fnObj.type),
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
            cellDefs.parallel
        );
    };


    _addParallelFor = () => {
        this._addCell(
            new afcl.functions.ParallelFor('ParallelFor'),
            cellDefs.parallelFor
        );
    };

    _addCell = (userObj, cellDef) => {
        const {graph} = this.state;

        var parent = graph.getDefaultParent();

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let v = graph.insertVertex(parent, null, userObj, 20, 20, cellDef.width ?? 80, cellDef.height ?? 40, cellDef.name);
            v.setType(cellDef.type || cellDef.name);

            // add sub cells, if any
            if (cellDef.subCells) {
                for (let subCell in cellDef.subCells) {
                    let subV = graph.insertVertex(
                        v,
                        null,
                        subCell,
                        cellDef.subCells[subCell].x,
                        cellDef.subCells[subCell].y,
                        cellDefs[subCell].width,
                        cellDefs[subCell].height,
                        cellDefs[subCell].name,
                        true
                    );
                    subV.getGeometry().offset = cellDef.subCells[subCell].offset;
                    subV.setType(cellDefs[subCell].type || cellDefs[subCell].name);
                }
            }
        } finally {
            // Updates the display
            graph.getModel().endUpdate();
        }
    };

    _removeSelected = () => {
        const {graph} = this.state;
        graph.isEnabled() && graph.removeCells(graph.getSelectionCells());
    };

    _showXml = () => {
        mxUtils.popup(this._getWorkflowXml(), true);
    };

    _validateGraph = () => {
        const {graph} = this.state;
        graph.validateGraph();
    };

    _getWorkflowXml = () => {
        const {workflow} = this.state;
        const {graph} = this.state;
        workflow.setBody(graph.getModel().cells);

        const enc = new mxCodec(mxUtils.createXmlDocument());
        const xmlModel = enc.encode(workflow);

        return mxUtils.getPrettyXml(xmlModel);
    };

    _saveWorkflow = (type) => {
        const {graph} = this.state;

        if (graph.isEmpty()) {
            alert('Cannot save an empty graph');
            return;
        }

        if (this.state.workflow.getName().length == 0) {
            alert('Please provide a name');
            return;
        }

        switch (type) {
            case 'xml':
                var blob = new Blob([this._getWorkflowXml()], {type: "text/xml;charset=utf-8"});
                FileSaver.saveAs(blob, this.state.workflow.getName() + '.xml');
                break;
            case 'yaml':
                axios.post(
                    'api/workflow/convert',
                    this._getWorkflowXml(),
                    {
                        headers: {
                            'Content-Type': 'text/xml',
                            'Accept': 'application/x-yaml'
                        }
                    }
                ).then(response => {
                    var blob = new Blob([response.data], {type: "application/x-yaml;charset=utf-8"});
                    FileSaver.saveAs(blob, this.state.workflow.getName() + '.yaml');
                });
            case 'json':
                axios.post(
                    'api/workflow/convert',
                    this._getWorkflowXml(),
                    {
                        transformResponse: [(data) => { return data; }], //https://github.com/axios/axios/issues/907
                        headers: {
                            'Content-Type': 'text/xml',
                            'Accept': 'application/json'
                        }
                    }
                ).then(response => {
                    var blob = new Blob([response.data], {type: "application/json;charset=utf-8"});
                    FileSaver.saveAs(blob, this.state.workflow.getName() + '.json');
                });
        }
    };

    // Parses the mxGraph XML file format
    _loadWorkflow = (file) => {

        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        axios.post('api/workflow/load');

        const {graph} = this.state;

        console.log(file);

    };

    _showWorkflowFileDialog = () => {
        this.setState({
            isLoading: true
        });
    };

    render() {
        if (this.state.isLoading) {
            return <div>
                <Spinner size="lg" />
            </div>
        }
        return <div className="animated fadeIn">
            <Row>
                <Col>
                    <div className="position-relative w-100 h-100">
                        <Sidebar />
                        <ButtonGroup className="graph-toolbar2">
                            <Button light="true" onClick={this._addStart}>Start</Button>
                            <Button onClick={this._addEnd}>End</Button>
                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret>
                                    Function
                                </DropdownToggle>
                                <DropdownMenu>
                                    <FuntionsContext.Consumer>
                                        {fc => (
                                            fc.functions.map(fn => <DropdownItem
                                                onClick={() => this._addFn(fn)}>{fn.name}<Badge>{fn.type}</Badge></DropdownItem>)
                                        )}
                                    </FuntionsContext.Consumer>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                            <Button onClick={this._addIfThenElse}>If-Then-Else</Button>
                            <Button onClick={this._addSwitch}>Switch</Button>
                            <Button onClick={this._addMerge}>Merge</Button>
                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret>
                                    Compound Parallel
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={this._addParallel}>Parallel</DropdownItem>
                                    <DropdownItem onClick={this._addParallelFor}>ParallelFor</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                            <Button onClick={this._showXml}>XML</Button>
                            <Button onClick={this._validateGraph}>Validate</Button>
                            <UncontrolledButtonDropdown>
                                <DropdownToggle caret>
                                    Save
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => this._saveWorkflow('xml')}>XML<Badge color="secondary">GUI</Badge></DropdownItem>
                                    <DropdownItem onClick={() => this._saveWorkflow('yaml')}>YAML</DropdownItem>
                                    <DropdownItem onClick={() => this._saveWorkflow('json')}>JSON</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                            <FileUpload onSelect={(file) => this._loadWorkflow(file)} />
                        </ButtonGroup>
                        <div className="graph-wrapper">
                            <div id="graph" className="graph" ref="_graphContainer"/>
                        </div>
                    </div>
                </Col>
                <Col className="editor-property-view">
                    <Card>
                        <CardHeader>Properties</CardHeader>
                        <CardBody>
                            {this.state.selectedCell?.value instanceof afcl.functions.AtomicFunction && <AtomicFunctionProperties obj={this.state.selectedCell.value} />}
                            {this.state.selectedCell?.value instanceof afcl.functions.IfThenElse && <IfThenElseProperties obj={this.state.selectedCell.value} />}
                            {this.state.selectedCell?.value instanceof afcl.functions.Switch && <SwitchProperties obj={this.state.selectedCell.value} />}
                            {this.state.selectedCell?.value instanceof afcl.functions.Parallel && <ParallelProperties obj={this.state.selectedCell.value} />}
                            {this.state.selectedCell?.value instanceof afcl.functions.ParallelFor && <ParallelForProperties obj={this.state.selectedCell.value} />}
                            {this.state.selectedCell ? <CellProperties cell={this.state.selectedCell} /> : <WorkflowProperties workflow={this.state.workflow} /> }
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Modal isOpen={this.state.isLoadWorkflowModalOpen}>
                <ModalHeader toggle={this._toggleLoadWorkflowModal}>Modal Header</ModalHeader>
                <ModalBody>
                    <WorkflowUploadForm />
                </ModalBody>
            </Modal>
        </div>
    }

}

export default WorkflowEditor;