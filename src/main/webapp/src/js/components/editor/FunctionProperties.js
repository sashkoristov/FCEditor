/**
 * Function Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';

class FunctionProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        prevProps.obj.setDataIn(this.state.dataIn);
        prevProps.obj.setDataOut(this.state.dataOut);
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    componentWillUnmount() {
        this.props.obj.setDataIn(this.state.dataIn);
        this.props.obj.setDataOut(this.state.dataOut);
    }

    render() {
        return <>
                <div><strong>AtomicFunction</strong></div>
                <Form>
                    <FormGroup>
                        <div>Name: {this.props.obj.getName()}</div>
                        <div>Type: {this.props.obj.getType()}</div>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Data In" value={this.state.dataIn} onChange={(e) => { this.setState({dataIn: e.target.value}) }} />
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Data Out" value={this.state.dataOut} onChange={(e) => { this.setState({dataOut: e.target.value}) }} />
                    </FormGroup>
                </Form>
            </>
    }

}

export default FunctionProperties;