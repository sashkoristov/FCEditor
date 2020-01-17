/**
 * IfThenElse Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';

class IfThenElseProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentWillUnmount() {
        this.props.obj.setCondition(this.state.condition);
    }

    render() {
        return <>
                <Form>
                    <FormGroup>
                        <strong>IfThenElse</strong>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Condition" value={this.state.condition} onChange={(e) => { this.setState({condition: e.target.value}) }} />
                    </FormGroup>
                </Form>
            </>
    }

}

export default IfThenElseProperties;