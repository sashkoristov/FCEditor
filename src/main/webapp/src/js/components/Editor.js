/**
 * Workflow Editor Component
 *
 * @author Ben Walch, 2019-2020
 *
 */

import axios from 'axios';
import React from 'react';
import { Prompt } from 'react-router';

import {
    Button,
    Row,
    Col,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody
} from 'reactstrap';

import FileSaver from 'file-saver';
import FileDialog from 'file-dialog'

import mxgraph from '../mxgraph';
const {
    mxClient,
    mxCodec,
    mxConstants,
    mxClipboard,
    mxEvent,
    mxHierarchicalLayout,
    mxKeyHandler,
    mxEdgeHandler,
    mxRubberband,
    mxUtils,
    mxPoint,
    mxUndoManager,
    mxImage
} = mxgraph;

import pointImg from '../../assets/images/point.svg';
import checkImg from '../../assets/images/check.svg';
import cancelImg from '../../assets/images/cancel.svg';

import * as utils from '../utils/';
import * as afcl from '../afcl/';
import * as CellGenerator from '../graph/util/CellGenerator';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph';
import {cellStyle, edgeStyle} from '../graph/styles';

import AfclCodec from '../graph/io/AfclCodec';
import AfclSwimlaneLayout from '../graph/layout/AfclSwimlaneLayout';
import NestedSwimlaneLayout from '../graph/layout/NestedSwimlaneLayout';

import AdaptationForm from './AdaptationForm';

import Sidebar from './editor/Sidebar';
import Toolbar from './editor/Toolbar';

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
class Editor extends React.Component {

    // initial position for placing new cells
    INIT_POSITION = new mxPoint(40, 40);

    XML_MIME_TYPES = ['text/xml', 'application/xml'];
    JSON_MIME_TYPES = ['application/json'];
    YAML_MIME_TYPES = [
        'text/vnd.yaml',
        'application/vnd.yaml',
        'text/x-yaml',
        'application/x-yaml',
        'text/yaml'
    ];

    constructor(props) {
        super(props);

        this.state = {
            workflow: new afcl.Workflow('Untitled'),
            graph: {},
            selectedCell: null,
            isLoading: false,
            isEditing: false,
            isAdaptationModalOpen: false
        };

        // wether to record undoable changes
        this.recordUndoableChanges = true;

        // check if graph is initialized
        this.initialized = false;
    }

    componentDidMount() {
        this._createGraph();

        window.onbeforeunload = function() { return 'Leave page? changes lost'; };
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
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

            container.setAttribute('tabindex', '-1');
        }

        this.setState({
            graph: graph
        }, () => {
            this._configureGraph();
        });
    };

    _configureGraph = () => {
        const {graph} = this.state;

        graph.border = 60;
        graph.gridSize = 4;
        graph.setPanning(true);
        graph.setTooltips(true);
        graph.setConnectable(true);
        graph.setCellsEditable(true);
        graph.setEnterStopsCellEditing(true);
        graph.setEnabled(true);
        graph.setHtmlLabels(false);
        graph.centerZoom = true;

        graph.setDropEnabled(true);
        graph.setSplitEnabled(false);
        graph.setAllowDanglingEdges(false);
        graph.allowAutoPanning = true;
        graph.setMultigraph(false);
        graph.setDisconnectOnMove(false);
        graph.setRecursiveResize(false);
        graph.setConstrainRelativeChildren(false);
        graph.setPortsEnabled(false);

        graph.resetEdgesOnResize = true;
        graph.resetEdgesOnMove = true;
        graph.resetEdgesOnConnect = true;

        //graph.maintainEdgeParent = false;

        // Enables rubberband selection
        new mxRubberband(graph);

        // Applies size changes to siblings and parents
        //new mxSwimlaneManager(graph);

        // Enables Guides
        graph.graphHandler.guidesEnabled = true;

        // ?
        graph.connectionHandler.movePreviewAway = false;

        // override mxEdgeHandler isConnectableCell
        mxEdgeHandler.prototype.isConnectableCell = cell => {
            return graph.connectionHandler.isConnectableCell(cell);
        };

        // Disables existing port functionality
        graph.view.getTerminalPort = (state, terminal, source) => {
            return terminal;
        };

        // sets the port image
        graph.connectionHandler.constraintHandler.pointImage = new mxImage(pointImg, 16, 16);

        // gets the respective port image
        graph.connectionHandler.constraintHandler.getImageForConstraint = (state, constraint, point) => {
            switch (constraint.id) {
                case 'then':
                    return new mxImage(checkImg, 16, 16);
                case 'else':
                    return new mxImage(cancelImg, 16, 16);
            }
            return graph.connectionHandler.constraintHandler.pointImage;
        };

        // undo manager
        this._undoManager = new mxUndoManager();
        let listener = (sender, evt) => this.recordUndoableChanges && this._undoManager.undoableEditHappened(evt.getProperty('edit'));
        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        // add/remove cells callback
        graph.addListener(mxEvent.CELLS_ADDED, (sender, evt) => {
            let addedCells = evt.getProperty('cells');
            this._onCellsAdded(addedCells);
        });
        graph.addListener(mxEvent.CELLS_REMOVED, (sender, evt) => {
            let removedCells = evt.getProperty('cells');
            this._onCellsRemoved(removedCells);
        });

        // on select callback
        graph.selectionCellsHandler.addListener(mxEvent.ADD, (sender, evt) => {
            this._onCellSelectionChange();
        });
        graph.selectionCellsHandler.addListener(mxEvent.REMOVE, (sender, evt) => {
            this._onCellSelectionChange();
        });

        // on connect callback
        graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
            let edge = evt.getProperty('cell');
            let source = graph.getModel().getTerminal(edge, true);
            let target = graph.getModel().getTerminal(edge, false);

            let style = graph.getCellStyle(edge);
            let sourcePort = style[mxConstants.STYLE_SOURCE_PORT];
            let targetPort = style[mxConstants.STYLE_TARGET_PORT];


            this._onCellConnected(edge, source, target, sourcePort, targetPort);
        });

        // on label change
        graph.addListener(mxEvent.LABEL_CHANGED, (sender, evt) => {
            // update property view
            this.setState({
                selectedCell: evt.getProperty('cell')
            });
        });

        // key handler
        this._keyHandler = new mxKeyHandler(graph);
        this._keyHandler.getFunction = (evt) => {
            if (evt != null)
            {
                return (mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey)) ? this._keyHandler.controlKeys[evt.keyCode] : this._keyHandler.normalKeys[evt.keyCode];
            }

            return null;
        };

        this._keyHandler.bindKey(46, this._removeSelected);
        this._keyHandler.bindKey(8, this._removeSelected);

        this._keyHandler.bindControlKey(90, () => this._undoManager.undo());
        this._keyHandler.bindControlKey(89, () => this._undoManager.redo());

        this._keyHandler.bindControlKey(67, () => mxClipboard.copy(graph));
        this._keyHandler.bindControlKey(86, () => mxClipboard.paste(graph));

        // fix focus
        this._focusGraph();

        // style
        this._setGraphStyle();

        // constraints
        this._setGraphConstraints();

        this.initialized = true;
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

    _focusGraph = () => {
        // https://jgraph.github.io/mxgraph/docs/known-issues.html#Focus
        this.state.graph.container.focus();
    };

    _onCellsAdded = (addedCells) => {
        this._updateEditingState();
        this._focusGraph();
    };

    _onCellsRemoved = (removedCells) => {
        this._updateEditingState();
        this._focusGraph();
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
    };

    _onCellSelected = (cell) => {
        this.setState({
            selectedCell: cell
        });
        this._focusGraph();
    };

    _onCellConnected = (edge, source, target, sourcePort, targetPort) => {
        const {graph} = this.state;

        // connection comes from switch - set a case label and allow editing
        if (source.value instanceof afcl.functions.Switch) {
            edge.setValue('[Case ...]');
            edge.setStyle(mxUtils.setStyle(edge.getStyle(), mxConstants.STYLE_EDITABLE, true));
        }

        // if connection has if as source - set port id (then or else) as label
        if (source.value instanceof afcl.functions.IfThenElse) {
            edge.setValue(sourcePort);
        }
    };

    _updateEditingState = () => {
        this.setState({
            'isEditing':
                !this.state.graph.isEmpty() ||
                this.state.workflow.getName() != 'Untitled'
        });
    };

    _removeSelected = () => {
        const {graph} = this.state;
        graph.isEnabled() && graph.removeCells(graph.getSelectionCells());
    };

    _zoomTo = (scale) => {
        const {graph} = this.state;
        graph.zoomTo(scale, false);
    };

    _undo = () => {
        this._undoManager.undo();
    };

    _redo = () => {
        this._undoManager.redo();
    };

    _doLayout = () => {
        const {graph} = this.state;

        // since the layout process produces a lot of single steps,
        // don't add them to the undo manager
        this.recordUndoableChanges = false;

        // define the layout for the single swimlanes
        let swimlaneLayout = new AfclSwimlaneLayout(graph, mxConstants.DIRECTION_NORTH);

        swimlaneLayout.resizeParent = true;
        swimlaneLayout.disableEdgeStyle = false;
        swimlaneLayout.interRankCellSpacing = 40; // vertical spacing between connected cells
        swimlaneLayout.intraCellSpacing = 10; // horizontal spacing between cells on same branch
        swimlaneLayout.parentBorder = 20; // group border
        swimlaneLayout.traverseAncestors = false; // wether to drill down into children

        // this layout walks through the graph and executes the swimlaneLayout on each found swimlane
        let nestedSwimlaneLayout = new NestedSwimlaneLayout(graph, swimlaneLayout);

        // define the 'root' layout to apply on graph root level
        let rootLayout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
        rootLayout.resizeParent = true;
        rootLayout.disableEdgeStyle = false;
        swimlaneLayout.interHierarchySpacing = 20;
        rootLayout.interRankCellSpacing = 50; // vertical spacing between connected cells
        rootLayout.intraCellSpacing = 20;
        rootLayout.traverseAncestors = false; // wether to drill down into children;

        // order is important here
        // first, execute the swimlane layout on swimlanes
        nestedSwimlaneLayout.execute(graph.getDefaultParent());

        // second, execute the root layout
        rootLayout.execute(graph.getDefaultParent());

        // reset all edges
        for (let edge of graph.getModel().filterDescendants(c => c.isEdge())) {
            graph.resetEdge(edge);
        }
        this.recordUndoableChanges = true;

        graph.refresh();
    };

    _validateWorkflow = () => {
        const {graph} = this.state;
        return graph.validateGraph();
    };

    _getWorkflowXml = (prettyPrint) => {
        const {workflow} = this.state;
        const {graph} = this.state;

        workflow.setBody(graph.getModel().filterDescendants());

        const enc = new mxCodec(mxUtils.createXmlDocument());
        const xmlModel = enc.encode(workflow);

        return prettyPrint ? mxUtils.getPrettyXml(xmlModel) : mxUtils.getXml(xmlModel);
    };

    _saveWorkflow = (type) => {
        const {graph} = this.state;

        if (graph.isEmpty()) {
            alert('Cannot save an empty workflow');
            return;
        }

        if (this._validateWorkflow() != null) {
            alert('Cannot save an invalid workflow');
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
                    'api/workflow/convert/fromEditorXml',
                    {
                        workflow: this._getWorkflowXml()
                    },
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
                break;
            case 'json':
                axios.post(
                    'api/workflow/convert/fromEditorXml',
                    {
                        workflow: this._getWorkflowXml()
                    },
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
                break;
        }
    };

    _loadWorkflow = () => {

        let allMimeTypes = this.JSON_MIME_TYPES.concat(this.XML_MIME_TYPES).concat(this.YAML_MIME_TYPES);

        FileDialog({
            multiple: false,
            accept: allMimeTypes
        }).then(async files => {
            let file = files[0];

            if (!file) {
                return;
            }

            if (file.type != '' && !allMimeTypes.includes(file.type)) {
                alert('Unsupported file type');
                return;
            }

            this.setState({ isLoading: true });

            // a little delay ;)
            await utils.sleep(500);

            let reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let contents = e.target.result;
                    switch (true) {
                        case this.XML_MIME_TYPES.includes(file.type):
                            this._loadXml(contents);
                            break;
                        case this.JSON_MIME_TYPES.includes(file.type):
                            this._loadJson(contents) && this._doLayout();
                            break;
                        default:
                            this._loadYaml(contents) && this._doLayout();
                    }
                } catch (error) {
                    console.log(error);
                    alert(error);
                } finally {
                    this.setState({ isLoading: false });
                }
            };
            reader.readAsText(file);
        });
    };

    _loadXml = (xmlString) => {
        const {graph} = this.state;

        // Parses the mxGraph XML file format
        let xmlDoc = mxUtils.parseXml(xmlString);
        let decoder = new mxGraphOverrides.Codec(xmlDoc);
        let workflow = decoder.decode(xmlDoc.documentElement);

        this._drawWorkflow(workflow);
    };

    _loadYaml = (yamlString) => {
        const {graph} = this.state;

        let decoder = new AfclCodec();

        let workflow = decoder.decodeYamlWorkflow(yamlString);

        if (workflow instanceof afcl.Workflow) {
            this._drawWorkflow(workflow);
            return true;
        }
        return false;
    };

    _loadJson = (jsonString) => {
        const {graph} = this.state;

        let decoder = new AfclCodec();
        let workflow = decoder.decodeJsonWorkflow(jsonString);

        if (workflow instanceof afcl.Workflow) {
            this._drawWorkflow(workflow);
            return true;
        }
        return false;
    };

    _drawWorkflow = (workflow) => {
        const {graph} = this.state;

        let vertices = workflow.getBody().filter(cell => cell.isVertex());
        let edges = workflow.getBody().filter(cell => cell.isEdge());

        // clear graph
        graph.getModel().clear();

        graph.getModel().beginUpdate();

        try {
            vertices.map(v => {
                if (v.getType() != null) {
                    let parent = v.getParent().getId() !== graph.getDefaultParent().getId() ? graph.getModel().getCell(v.getParent().getId()) : graph.getDefaultParent();
                    graph.addCell(
                        v,
                        parent,
                        v.getId()
                    );
                }
            });
            edges.map(e => {
                let parent = e.getParent().getId() !== graph.getDefaultParent().getId() ? graph.getModel().getCell(e.getParent().getId()) : graph.getDefaultParent();
                graph.addCell(
                    e,
                    parent,
                    e.getId()
                );
            });
        } finally {
            graph.getModel().endUpdate();
        }

        this.setState({ workflow: workflow });
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
        return this._addCell('Start', cellDefs.start);
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
        return this._addCell('End', cellDefs.end);
    };

    _addMerge = () => {
        return this._addCell('merge', cellDefs.merge);
    };

    _addFn = (fnObj) => {
        return this._addCell(
            new afcl.functions.AtomicFunction(fnObj.name, fnObj.type),
            cellDefs.fn
        );
    };

    _addIfThenElse = () => {
        const {graph} = this.state;

        return this._addCell(
            new afcl.functions.IfThenElse(graph.getUniqueLabel('IfThenElse', cellDefs.cond.type)),
            cellDefs.cond
        );
    };

    _addSwitch = () => {
        const {graph} = this.state;

        return this._addCell(
            new afcl.functions.Switch(graph.getUniqueLabel('Switch', cellDefs.multicond.type)),
            cellDefs.multicond
        );
    };

    _addParallel = () => {
        const {graph} = this.state;

        return this._addCell(
            new afcl.functions.Parallel(graph.getUniqueLabel('Parallel', cellDefs.parallel.type)),
            cellDefs.parallel
        );
    };

    _addParallelFor = () => {
        const {graph} = this.state;

        return this._addCell(
            new afcl.functions.ParallelFor(graph.getUniqueLabel('ParallelFor', cellDefs.parallelFor.type)),
            cellDefs.parallelFor
        );
    };

    _addCell = (userObj, cellDef) => {
        const {graph} = this.state;

        let parent = graph.getDefaultParent();

        let cell = CellGenerator.generateVertexCell(cellDef, userObj);

        // set initial position
        if (cell.getGeometry() != null) {
            cell.getGeometry().x = this.INIT_POSITION.x;
            cell.getGeometry().y = this.INIT_POSITION.y;
        }

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            graph.addCell(cell, parent);
        } finally {
            // Updates the display
            graph.getModel().endUpdate();
        }

        graph.setSelectionCell(cell);

    };

    // === Workflow Adaptation: begin ===

    _onAdaptWorkflowClicked = () => {
        const {graph} = this.state;

        if (!this.state.isAdaptationModalOpen) {
            if (graph.isEmpty()) {
                alert('Cannot adapt an empty workflow');
                return;
            }

            if (this._validateWorkflow() != null) {
                alert('Cannot adapt an invalid workflow');
                return;
            }
            this._toggleAdaptationModal();
        }
    };

    _toggleAdaptationModal = () => {
        this.setState({
            isAdaptationModalOpen: !this.state.isAdaptationModalOpen
        });
    };

    _getNamesForAdaptation() {
        if (this.initialized) {
            const {graph} = this.state;
            return graph.getModel().filterDescendants(c => c instanceof mxGraphOverrides.Cell && c.getType() == cellDefs.parallelFor.type).map(c => c.getValue().getName());
        }
        return []
    }

    _adaptWorkflow = (adaptations) => {
        if (this.state.isAdaptationModalOpen) {
            this._toggleAdaptationModal();
        }

        const {graph} = this.state;

        this.setState({ isLoading: true });

        axios.post(
            'api/workflow/adapt/fromEditorXml',
            {
                adaptations: adaptations,
                workflow: this._getWorkflowXml()
            },
            {
                transformResponse: [(data) => { return data; }], //https://github.com/axios/axios/issues/907
                headers: {
                    'Content-Type': 'text/xml',
                    'Accept': 'application/json'
                }
            }
        ).then(response => {
            this._loadJson(response.data) && this._doLayout();
            this.setState({ isLoading: false });
        })
    };

    // === Workflow Adaptation: end ===

    render() {
        return <div className="editor-component">
            {this.state.isLoading && <div class="loading-overlay"><Spinner size="lg" /></div>}
            <Row className="no-gutters flex-grow-1">
                <Col className="editor-graph-view">
                    <div className="component-view-header">
                        Graph
                        <Toolbar editor={this} />
                        <Button className="adaptation-btn" color="info" onClick={this._onAdaptWorkflowClicked}>
                            <span class="cil-diamond"></span> Adapt
                        </Button>
                    </div>
                    <div className="graph-wrapper animated fadeIn">
                        <Sidebar editor={this} />
                        <div id="graph" className="graph" ref="_graphContainer"/>
                    </div>
                </Col>
                <Col className="editor-property-view">
                    <div className="component-view-header">
                        Properties
                    </div>
                    <div className="editor-property-view-wrapper animated fadeIn">
                        {this.state.selectedCell?.value instanceof afcl.functions.AtomicFunction && <AtomicFunctionProperties obj={this.state.selectedCell.value} />}
                        {this.state.selectedCell?.value instanceof afcl.functions.IfThenElse && <IfThenElseProperties obj={this.state.selectedCell.value} />}
                        {this.state.selectedCell?.value instanceof afcl.functions.Switch && <SwitchProperties obj={this.state.selectedCell.value} />}
                        {this.state.selectedCell?.value instanceof afcl.functions.Parallel && <ParallelProperties obj={this.state.selectedCell.value} />}
                        {this.state.selectedCell?.value instanceof afcl.functions.ParallelFor && <ParallelForProperties obj={this.state.selectedCell.value} />}
                        {this.state.selectedCell ? <CellProperties cell={this.state.selectedCell} /> : <WorkflowProperties workflow={this.state.workflow} editor={this} /> }
                    </div>
                </Col>
            </Row>
            <Prompt when={this.state.isEditing} message={location => location.pathname.startsWith('/editor') ? true : 'Are you sure you want to go to ' + location.pathname + "?\n" + 'All unsaved changes will be lost.'} />
            <Modal isOpen={this.state.isAdaptationModalOpen} size="lg">
                <ModalHeader toggle={this._toggleAdaptationModal}>Adapt Workflow</ModalHeader>
                <ModalBody>
                    <AdaptationForm toAdapt={this._getNamesForAdaptation()} onConfirm={this._adaptWorkflow} onCancel={this._toggleAdaptationModal} />
                </ModalBody>
            </Modal>
        </div>
    }

}

export default Editor;