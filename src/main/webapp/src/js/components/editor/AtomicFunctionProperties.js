/**
 * Function Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, CardBody, Form, FormGroup, Label, Input, Button, Badge } from 'reactstrap';

import DataInsProperties from './DataInsProperties';

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
        let tmpState = {...this.state};
        tmpState[type][index][prop] = newVal;
        this.setState(tmpState);
    };

    _addDataItem = (type) => {
        let tmpState = {...this.state};
        let className = type.charAt(0).toUpperCase() + type.slice(1);
        tmpState[type].push(new afcl.objects[className]());
        this.setState(tmpState);
    };

    _removeDataItem = (type, index) => {
        let tmpState = {...this.state};
        tmpState[type].splice(index,1);
        this.setState(tmpState);
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
                            <div className="text-right"><Button size="sm" color="danger" onClick={() => this._removeDataItem('dataIns', index)}><span className="cil-minus"></span></Button></div>
                            <DataInsProperties obj={dataIn} key={"AtomicFn-DataIn-" + index} index={index} changeHandler={this._handleDataItemChange} />
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataIns')} size="sm"><span className="cil-plus"></span></Button>
                </Form>
                <Form>
                    <div className="font-weight-bold text-muted mb-1">Output Data</div>
                    {this.state.dataOuts.map((dataOut, index) => <>
                            <div className="text-right"><a className="text-danger p-1" onClick={() => this._removeDataItem('dataOuts', index)}><span className="cil-x"></span></a></div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="name" value={dataOut.name} onChange={e => this._handleDataItemChange('dataOuts', index, 'name', e.target.value)} />
                            </div>
                            <div className="mb-1">
                                <Input size="sm" type="select" placeholder="type" value={dataOut.type} onChange={e => this._handleDataItemChange('dataOuts', index, 'type', e.target.value)}>
                                    <option></option>
                                    {Object.keys(afcl.types).map(t => <option value={t}>{afcl.types[t]}</option>)}
                                </Input>
                            </div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="source" value={dataOut.source} onChange={e => this._handleDataItemChange('dataOuts', index, 'source', e.target.value)} />
                            </div>
                            <hr />
                        </>
                    )}
                    <Button color="primary" onClick={() => this._addDataItem('dataOuts')} size="sm"><span className="cil-plus"></span></Button>
                </Form>
            </>
    }

}

export default FunctionProperties;