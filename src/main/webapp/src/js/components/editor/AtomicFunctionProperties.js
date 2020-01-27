/**
 * Function Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, CardBody, Form, FormGroup, Label, Input, Button, Badge } from 'reactstrap';

import DataInsProperties from './DataInsProperties';
import DataOutsProperties from './DataOutsProperties';

import * as afcl from '../../afcl';

class FunctionProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        prevProps.obj.setDataIns(this.state.dataIns);
        prevProps.obj.setDataOuts(this.state.dataOuts);
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    componentWillUnmount() {
        this.props.obj.setDataIns(this.state.dataIns);
        this.props.obj.setDataOuts(this.state.dataOuts);
    }

    _handleDataItemChange = (type, index, prop, newVal) => {
        this.props.obj[type][index][prop] = newVal;
        this.setState(this.props.obj);
    };

    _addDataItem = (type) => {
        let className = type.charAt(0).toUpperCase() + type.slice(1);
        this.props.obj[type].push(new afcl.objects[className]());
        this.setState(this.props.obj);
    };

    _removeDataItem = (type, index) => {
        this.props.obj[type].splice(index,1);
        this.setState(this.props.obj);
    }

    render() {
        return <>
                <CardTitle className="h5">AtomicFunction</CardTitle>
                <div className="mb-3">
                    <div>Name: {this.props.obj.getName()}</div>
                    <div>Type: <Badge>{this.props.obj.getType()}</Badge></div>
                </div>
                <Form>
                    <div className="font-weight-bold text-muted mb-1">Input data</div>
                    {this.state.dataIns.map((dataIn, index) => <>
                            <DataInsProperties obj={dataIn} index={index} changeHandler={this._handleDataItemChange} removeHandler={this._removeDataItem} key={"AtomicFunction-DataIns-" + index} />
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataIns')} size="sm"><span className="cil-plus"></span></Button>
                </Form>
                <Form>
                    <div className="font-weight-bold text-muted mb-1">Output Data</div>
                    {this.state.dataOuts.map((dataOut, index) => <>
                            <DataOutsProperties obj={dataOut} index={index} changeHandler={this._handleDataItemChange} removeHandler={this._removeDataItem} key={"AtomicFunction-DataOuts-" + index} />
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataOuts')} size="sm"><span className="cil-plus"></span></Button>
                </Form>
            </>
    }

}

export default FunctionProperties;