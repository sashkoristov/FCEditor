import React from 'react';
import { Container, Col, FormGroup, Label, Input } from 'reactstrap';
import { AppBreadcrumb } from "@coreui/react";
import routes from "../routes";
import * as router from "react-router-dom";
import AppContext from "../context/AppContext";

class Settings extends React.Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);
    }

    _onMaxConcurrentFunctionsChanged = (e) => {
        if (e.target.value.match(/^\d*$/)) {
            this.context.setSettings({
                adaptation: { maxConcurrentFunctions: parseInt(e.target.value) || 0 }
            });
        }
    };

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                    <div className="animated fadeIn">
                        <div className="mb-4">
                            <h2>User Interface</h2>
                            <FormGroup row>
                                <Label md="2">
                                    Sidebar mode<br/>
                                    <span className="text-muted small">Select wether the sidebar should stay collapsed or expanded</span>
                                </Label>
                                <Col md="2">
                                    <Input type="select" value={this.context.settings.ui.sidebarCollapsed} onChange={e => this.context.setSetting('ui', {...this.context.settings.ui, sidebarCollapsed: e.target.value === 'true' })}>
                                        <option value={true}>collapsed</option>
                                        <option value={false}>expanded</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="mb-4">
                            <h2>Adaptation</h2>
                            <FormGroup row>
                                <Label md="2">
                                    Max concurrent functions<br />
                                    <span className="text-muted small">Specify the maximum number of concurrent function executions</span>
                                </Label>
                                <Col md="2">
                                    <Input placeholder="Max concurrent functions" value={this.context.settings.adaptation.maxConcurrentFunctions} onChange={this._onMaxConcurrentFunctionsChanged} />
                                </Col>
                            </FormGroup>
                        </div>
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