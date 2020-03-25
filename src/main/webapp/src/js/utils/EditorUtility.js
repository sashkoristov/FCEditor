import Yaml from 'js-yaml';

import * as utils from './';
import * as afcl from '../afcl/';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph/';
import * as CellGenerator from '../graph/util/CellGenerator';

import mxgraph from '../mxgraph';
const { mxUtils, mxConstants, mxGraphModel, mxGeometry } = mxgraph;

class EditorUtility {

    constructor() {
        this.createRoot();
    }

    createRoot() {
        this.root = new mxGraphOverrides.Cell();
        this.root.insert(new mxGraphOverrides.Cell());
    }

    getDefaultParent() {
        return this.root.getChildAt(0);
    }

    getGraphWorkflow(afclYamlString) {

        let workflow = new afcl.Workflow();

        try {
            let _yamlObj = Yaml.safeLoad(afclYamlString);

            this._setPrimitiveProperties(workflow, _yamlObj);
            this._setCommonProperties(workflow, _yamlObj);

            let list = this._generateFunctions(_yamlObj['workflowBody'], this.getDefaultParent());

            /*
            let startCell = CellGenerator.generateVertexCell(cellDefs.start, utils.capitalize(cellDefs.start.name));
            this.model.add(this.getDefaultParent(), startCell);

            let endCell = CellGenerator.generateVertexCell(cellDefs.end, utils.capitalize(cellDefs.end.name));
            let fromCell = this.getLastInsertedVertex(this.getDefaultParent());
            this.model.add(this.getDefaultParent(), endCell);
            this.model.add(this.getDefaultParent(), CellGenerator.generateEdgeCell(fromCell, endCell));
             */

            workflow.setBody(list);

        } catch (error) {
            if (error instanceof Yaml.YAMLException) {
                alert('Error loading YAML. Invalid file contents');
            }
            console.log(error);
        }

        return workflow;
    }

    _generateFunctions(fnArr, currentParent, list = null) {
        if (list == null) {
            list = [];
        }
        fnArr.forEach(fn => {
            for (var key in fn) {
                switch (key) {
                    case 'function':
                        let fnCell = CellGenerator.generateVertexCell(cellDefs.fn, this._generateAtomicFunction(fn[key]));
                        fnCell.setParent(currentParent);
                        list.push(fnCell);
                        break;
                    case 'parallelFor':
                        let parForCell = CellGenerator.generateVertexCell(cellDefs.parallelFor, this._generateParallelFor(fn[key]));
                        parForCell.setParent(currentParent);
                        parForCell.setChildren(parForCell.getChildren().concat(this._generateFunctions(fn[key]['loopBody'], parForCell)));
                        list.push(parForCell);
                        break;
                    case 'parallel':
                        let parCell = CellGenerator.generateVertexCell(cellDefs.parallel, this._generateParallel(fn[key]));
                        parCell.setParent(currentParent);
                        let sections = fn[key]['parallelBody'].map(el => {
                            if (el['section']) {
                                return this._generateFunctions(el['section'], parCell);
                            }
                            return null;
                        }).filter(e => e != null);
                        let forkCell = parCell.getChildOfType(cellDefs.fork.name);
                        let joinCell = parCell.getChildOfType(cellDefs.join.name);
                        sections.forEach(section => {
                                let sectionVertex = section.filter(c => c.isVertex());
                                if (sectionVertex.length > 0) {
                                    // generate edge from fork to first cell of each section
                                    let forkEdge = CellGenerator.generateEdgeCell(forkCell, sectionVertex[0]);
                                    forkEdge.setParent(currentParent);
                                    forkEdge.setStyle(mxUtils.setStyle(forkEdge.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                                    sectionVertex[0].insertEdge(forkEdge, false);
                                    list.push(forkEdge);
                                    // generate edge from last cell of each section to join
                                    let joinEdge = CellGenerator.generateEdgeCell(sectionVertex[sectionVertex.length-1], joinCell);
                                    joinEdge.setParent(currentParent);
                                    joinEdge.setStyle(mxUtils.setStyle(joinEdge.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'out'));
                                    sectionVertex[sectionVertex.length-1].insertEdge(joinEdge, true);
                                    list.push(joinEdge);
                                }
                        });
                        parCell.setChildren(parCell.getChildren().concat(sections.reduce((acc, section) => acc.concat(section), [])));
                        list.push(parCell);
                        break;
                    case 'if':
                        let ifCell = CellGenerator.generateVertexCell(cellDefs.cond, this._generateIfThenElse(fn[key]));
                        ifCell.setParent(currentParent);
                        let thenBranch = this._generateFunctions(fn[key]['then'], currentParent);
                        let elseBranch = this._generateFunctions(fn[key]['else'], currentParent);
                        let mergeCell = CellGenerator.generateVertexCell(cellDefs.merge);
                        mergeCell.setParent(currentParent);
                        if (thenBranch.length > 0) {
                            // generate edge from ifCell to first cell in then branch
                            let thenEdge1 = CellGenerator.generateEdgeCell(ifCell, thenBranch[0]);
                            thenEdge1.setValue('then');
                            thenEdge1.setStyle(mxUtils.setStyle(thenEdge1.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'then'));
                            thenEdge1.setStyle(mxUtils.setStyle(thenEdge1.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                            ifCell.insertEdge(thenEdge1, true);
                            thenBranch[0].insertEdge(thenEdge1, false);
                            list.push(thenEdge1);
                            // generate edge from last cell in then branch to merge cell
                            let thenEdge2 = CellGenerator.generateEdgeCell(thenBranch[thenBranch.length-1], mergeCell);
                            thenEdge2.setStyle(mxUtils.setStyle(thenEdge2.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'out'));
                            thenEdge2.setStyle(mxUtils.setStyle(thenEdge2.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                            thenEdge2.setParent(currentParent);
                            thenBranch[thenBranch.length-1].insertEdge(thenEdge2, true);
                            mergeCell.insertEdge(thenEdge2, false);
                            list.push(thenEdge2);
                        }
                        // generate edge from ifCell to first cell in else branch
                        if (elseBranch.length > 0) {
                            let elseEdge1 = CellGenerator.generateEdgeCell(ifCell, elseBranch[0]);
                            elseEdge1.setValue('else');
                            elseEdge1.setStyle(mxUtils.setStyle(elseEdge1.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'else'));
                            elseEdge1.setStyle(mxUtils.setStyle(elseEdge1.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                            elseEdge1.setParent(currentParent);
                            ifCell.insertEdge(elseEdge1, true);
                            elseBranch[0].insertEdge(elseEdge1, false);
                            list.push(elseEdge1);
                            // generate edge from last cell in then branch to merge cell
                            let elseEdge2 = CellGenerator.generateEdgeCell(elseBranch[elseBranch.length-1], mergeCell);
                            elseEdge2.setStyle(mxUtils.setStyle(elseEdge2.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'out'));
                            elseEdge2.setStyle(mxUtils.setStyle(elseEdge2.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                            elseEdge2.setParent(currentParent);
                            elseBranch[elseBranch.length-1].insertEdge(elseEdge2, true);
                            mergeCell.insertEdge(elseEdge2, false);
                            list.push(elseEdge2);
                        }
                        list.push(ifCell);
                        list = list.concat(thenBranch);
                        list = list.concat(elseBranch);
                        list.push(mergeCell);
                        break;
                }
            }
        });
        // generate edges for program flow
        let vertexList = list.filter(c => c.isVertex());
        for (var i = 0; i < vertexList.length; i++) {
            let isFirst = i == 0;
            let isLast = i == vertexList.length-1;
            if (!isFirst) {
                // add edge from previous to this cell, if it has no incoming edges
                if (vertexList[i].getIncomingEdges().length == 0) {
                    let edge = CellGenerator.generateEdgeCell(vertexList[i-1], vertexList[i]);
                    edge.setParent(currentParent);
                    edge.setStyle(mxUtils.setStyle(edge.getStyle(), mxConstants.STYLE_SOURCE_PORT, 'out'));
                    edge.setStyle(mxUtils.setStyle(edge.getStyle(), mxConstants.STYLE_TARGET_PORT, 'in'));
                    list.push(edge);
                }
            }
        }
        return list;
    }

    _setPrimitiveProperties(afclObj, obj) {
        for (let key in obj) {
            let value = obj[key];
            if (typeof value === 'boolean' || typeof value == 'number' || typeof value == 'string') {
                afclObj[key] = obj[key];
            }
        }
    }

    _setCommonProperties(afclObj, obj) {
        for (let key in obj) {
            switch (key) {
                case 'constraints':
                case 'properties':
                    afclObj[key] = obj[key];
                    break;
                case 'dataIns':
                    obj[key].forEach(dataInsObj => {
                        afclObj.addDataIn(this._generateDataIns(dataInsObj));
                    });
                    break;
                case 'dataOuts':
                    obj[key].forEach(dataOutsObj => {
                        afclObj.addDataOut(this._generateDataOuts(dataOutsObj));
                    });
                    break;
            }
        }
    }

    _generateDataIns(obj) {
        let dataIns = new afcl.objects.DataIns();
        this._setPrimitiveProperties(dataIns, obj);
        this._setCommonProperties(dataIns, obj);
        return dataIns;
    }

    _generateDataOuts(obj) {
        let dataOuts = new afcl.objects.DataOuts();
        this._setPrimitiveProperties(dataOuts, obj);
        this._setCommonProperties(dataOuts, obj);
        return dataOuts;
    }

    _generateAtomicFunction(obj) {
        let atomicFunction = new afcl.functions.AtomicFunction();
        this._setPrimitiveProperties(atomicFunction, obj);
        this._setCommonProperties(atomicFunction, obj);
        return atomicFunction;
    }

    _generateParallelFor(obj) {
        let parFor = new afcl.functions.ParallelFor();
        let loopCounter = new afcl.objects.LoopCounter();
        this._setPrimitiveProperties(loopCounter, obj['loopCounter']);
        parFor.setLoopCount(loopCounter);
        this._setPrimitiveProperties(parFor, obj);
        this._setCommonProperties(parFor, obj);
        return parFor;
    }

    _generateParallel(obj) {
        let par = new afcl.functions.Parallel();
        this._setPrimitiveProperties(par, obj);
        this._setCommonProperties(par, obj);
        return par;
    }

    _generateIfThenElse(obj) {
        let ite = new afcl.functions.IfThenElse();
        let compCond = this._generateCompositeCondition(obj['condition']);
        ite.setCondition(compCond);
        this._setPrimitiveProperties(ite, obj);
        this._setCommonProperties(ite, obj);
        return ite;
    }

    _generateCompositeCondition(obj) {
        let compCond = new afcl.objects.CompositeCondition();
        this._setPrimitiveProperties(compCond, obj);
        obj['conditions'].forEach(condObj => {
            let cond = new afcl.objects.Condition();
            this._setPrimitiveProperties(cond, condObj);
            compCond.addCondition(cond);
        });
        return compCond;
    }

}

export default EditorUtility;