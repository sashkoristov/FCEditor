/**
 * Workflow Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Row, Card, CardTitle, Collapse, Input, Button } from 'reactstrap';

import DataInsProperties from './DataInsProperties';
import DataOutsProperties from './DataOutsProperties';

import * as afcl from '../../afcl';

class WorkflowProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            workflow: props.workflow,
            isWorkflowDebugOpen: false
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.workflow !== this.props.workflow) {
            this.setState({ workflow: nextProps.workflow });
        }
    }

    _handlePropChange = (prop, newVal) => {
        const {workflow} = this.state;
        workflow[prop] = newVal;
        this.setState({workflow: workflow});
    };

    _handleDataItemChange = (type, index, prop, newVal) => {
        const {workflow} = this.state;
        workflow[type][index][prop] = newVal;
        this.setState({workflow: workflow});
    };

    _addDataItem = (type) => {
        const {workflow} = this.state;
        let className = type.charAt(0).toUpperCase() + type.slice(1);
        workflow[type].push(new afcl.objects[className]());
        this.setState({workflow: workflow});
    };

    _removeDataItem = (type, index) => {
        const {workflow} = this.state;
        workflow[type].splice(index,1);
        this.setState({workflow: workflow});
    };

    render() {
        return <Card className="p-2">
                <CardTitle className="h5">Workflow</CardTitle>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-2">Name</div>
                    <Row className="no-gutters mb-1">
                        <Input value={this.state.workflow.name} onChange={e => this._handlePropChange('name', e.target.value)} />
                    </Row>
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Input data</div>
                    {this.state.workflow.dataIns.map((dataIn, index) => <>
                            <DataInsProperties obj={dataIn} index={index} changeHandler={this._handleDataItemChange} removeHandler={this._removeDataItem} key={"AtomicFunction-DataIns-" + index} />
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataIns')} size="sm"><span className="cil-plus"></span></Button>
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Output Data</div>
                    {this.state.workflow.dataOuts.map((dataOut, index) => <>
                            <DataOutsProperties obj={dataOut} index={index} changeHandler={this._handleDataItemChange} removeHandler={this._removeDataItem} key={"AtomicFunction-DataOuts-" + index} />
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataOuts')} size="sm"><span className="cil-plus"></span></Button>
                </div>
                <div>
                    <Button size="sm" color="link" className="px-0" onClick={() => this.setState({isWorkflowDebugOpen: !this.state.isWorkflowDebugOpen})}>Debug Information</Button>
                    <Collapse isOpen={this.state.isWorkflowDebugOpen}>
                        <pre>
                            {this.state.isWorkflowDebugOpen && this.props.editor._getWorkflowXml()}
                        </pre>
                    </Collapse>
                </div>
            </Card>
    }
}

export default WorkflowProperties;