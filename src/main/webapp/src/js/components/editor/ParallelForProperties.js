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

    componentWillUnmount() {
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
                </Form>
            </>
    }

}

export default ParallelForProperties;