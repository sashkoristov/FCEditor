/**
 * ParallelFor Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';

class ParallelForProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        prevProps.obj.setDataIn(this.state.dataIn);
        prevProps.obj.setDataOut(this.state.dataOut);
        prevProps.obj.setLoopCount(this.state.loopCount);
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    componentWillUnmount() {
        this.props.obj.setDataIn(this.state.dataIn);
        this.props.obj.setDataOut(this.state.dataOut);
        this.props.obj.setLoopCount(this.state.loopCount);
    }

    render() {
        return <>
                <Form>
                    <FormGroup>
                        <strong>ParrallelFor</strong>
                    </FormGroup>
                    <FormGroup>
                        <Input type="number" placeholder="Loop Count" value={this.state.loopCount} onChange={(e) => { this.setState({loopCount: e.target.value}) }} />
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

export default ParallelForProperties;