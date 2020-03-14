import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import {AppBreadcrumb} from "@coreui/react";
import routes from "../routes";
import * as router from "react-router-dom";

class Settings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                    <div className="animated fadeIn">
                        <Form horizontal>
                            <FormGroup row>
                                <Label sm="2">
                                    Test<br />
                                    <span class="text-muted small">help text ...</span>
                                </Label>
                                <Col sm="6">
                                    <Input placeholder="A constant 1 ..." />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm="2">Test 2</Label>
                                <Col sm="6">
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

system should accept number 4 divides*/