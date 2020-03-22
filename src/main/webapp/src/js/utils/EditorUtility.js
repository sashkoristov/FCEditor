import Yaml from 'js-yaml';

import * as utils from './';
import * as afcl from '../afcl/';
import * as cellDefs from '../graph/cells';
import * as mxGraphOverrides from '../graph/';
import * as CellGenerator from '../graph/util/CellGenerator';

import mxgraph from '../mxgraph';
const { mxGraphModel, mxGeometry } = mxgraph;

class EditorUtility {

    constructor() {
        this.reset();
    }

    reset() {
        this.model = new mxGraphModel();
    }

    getLastInsertedVertex(parent) {
        var lastId = this.model.nextId - 1;

        while (this.model.getCell(lastId).isEdge() && this.model.getCell(lastId).getParent().getId() !== parent.getId()) {
            lastId--;
        }
        return this.model.getCell(lastId);
    }

    getDefaultParent() {
        var root = this.model.getRoot();
        return this.model.getChildAt(root, 0);
    }

    getGraphWorkflow(afclYamlString) {

        let workflow = new afcl.Workflow();

        try {
            let _yamlObj = Yaml.safeLoad(afclYamlString);

            this._setPrimitiveProperties(workflow, _yamlObj);
            this._setCommonProperties(workflow, _yamlObj);

            let startCell = CellGenerator.generateVertexCell(cellDefs.start, utils.capitalize(cellDefs.start.name));
            this.model.add(this.getDefaultParent(), startCell);

            this._generateFunctions(_yamlObj['workflowBody'], this.getDefaultParent());

            let endCell = CellGenerator.generateVertexCell(cellDefs.end, utils.capitalize(cellDefs.end.name));
            let fromCell = this.getLastInsertedVertex(this.getDefaultParent());
            this.model.add(this.getDefaultParent(), endCell);
            this.model.add(this.getDefaultParent(), CellGenerator.generateEdgeCell(fromCell, endCell));

            workflow.setBody(this.model.getChildCells(this.getDefaultParent()));

        } catch (error) {
            if (error instanceof Yaml.YAMLException) {
                alert('Error loading YAML. Invalid file contents');
            }
            console.log(error);
        }

        return workflow;
    }

    _generateFunctions(fnArr, currentParent) {
        fnArr.forEach(fn => {
            let fromCell = this.getLastInsertedVertex(currentParent);
            for (var key in fn) {
                switch (key) {
                    case 'function':
                        let fnCell = CellGenerator.generateVertexCell(cellDefs.fn, this._generateAtomicFunction(fn[key]));
                        this.model.add(currentParent, fnCell);
                        this.model.add(currentParent, CellGenerator.generateEdgeCell(fromCell, fnCell));
                        break;
                    case 'parallelFor':
                        let parForCell = CellGenerator.generateVertexCell(cellDefs.parallelFor, this._generateParallelFor(fn[key]));
                        this.model.add(currentParent, parForCell);
                        this.model.add(currentParent, CellGenerator.generateEdgeCell(fromCell, parForCell));
                        this._generateFunctions(fn[key]['loopBody'], parForCell);
                        break;
                }
            }
        });
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
                        afclObj.addDataIn(this._generateDataOuts(dataOutsObj));
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
        let dataIns = new afcl.objects.DataIns();
        this._setPrimitiveProperties(dataIns, obj);
        this._setCommonProperties(dataIns, obj);
        return dataIns;
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

}

export default EditorUtility;