import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import {AppBreadcrumb} from "@coreui/react";
import routes from "../routes";
import * as router from "react-router-dom";

class Settings extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            maxNumberConcurrentFunctions: 1000
        }
    }

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                    <div className="animated fadeIn">
                        <Form horizontal>
                            <FormGroup row>
                                <Label md="2">
                                    Max concurrent functions<br />
                                    <span className="text-muted small">Specify the maximum number of concurrent function executions</span>
                                </Label>
                                <Col md="4">
                                    <Input type="number" placeholder="Max concurrent functions" value={this.state.maxNumberConcurrentFunctions} onChange={e => this.setState({ maxNumberConcurrentFunctions: e.target.value })} />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label md="2">Test 2</Label>
                                <Col md="4">
                                    <Input type="select">
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Form>
                    </div>
                </Container>
            </>
        )
    }

}

export default Settings;

/*
developer creates loop with 1000 iterations
inside the loop is collection with 10000 elements

with the language we will specify each 10 elements go to a function
first 10 go to f x, second 10 go to fn y

system should accept number 4 divides

scheduler (not part of thesis) will know limits for each provider
in the language there is a parallel loop

button: optimize
    input:
        - name(s) of the parallelFor
        - how many sections to create
        - for each section how many functions should be created (specify from, to and step for each parallelFor loop)

example
    create parallel section on top of the loop
        - inside the loop copy each parallel section
        - source of data input of parallelFor should be input of created parallel
        - source of parallel should be source of parallelFor (before optimization)
        - make an option for each parallelLoop (create same fields as if one creates workflow)
        - from, to, step

    input: how to distribute the input of the parallel across parallel for loops/sections

    BLOCK: how many elements of this parallelFor should be sent to each function
*/