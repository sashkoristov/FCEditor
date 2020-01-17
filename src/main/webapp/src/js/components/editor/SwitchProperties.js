/**
 * Switch Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';

class SwitchProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentWillUnmount() {
        this.props.obj.setDataEval(this.state.dataEval);
    }

    render() {
        return <>
                <Form>
                    <FormGroup>
                        <strong>Switch</strong>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Data Eval" value={this.state.dataEval} onChange={(e) => { this.setState({dataEval: e.target.value}) }} />
                    </FormGroup>
                </Form>
            </>
    }

}

export default SwitchProperties;