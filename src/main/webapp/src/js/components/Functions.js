import React from 'react';

import { Container, Row, Col, Card, Form, FormGroup, Label, Input, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import FunctionsContext from '../context/FunctionsContext';
import {AppBreadcrumb} from "@coreui/react";
import * as router from "react-router-dom";

import routes from "../routes";

const PROVIDERS = {
    aws: {
        name: 'AWS Lambda',
        icon: 'cib-amazon-aws'
    },
    google: {
        name: 'Google Cloud',
        icon: 'cib-google-cloud'
    },
    azure: {
        name: 'Microsoft Azure',
        icon: 'cib-microsoft'
    },
    ibm: {
        name: 'IBM Cloud',
        icon: 'cib-ibm'
    }
};

const INITIAL_STATE = {
    newFn: {
        name: '',
        type: '',
        provider: '',
        url: ''
    },
    isAddFunctionModalOpen: false
};

class Functions extends React.Component {

    static contextType = FunctionsContext;

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    _toggleAddFunctionModal = () => {
        const { isAddFunctionModalOpen } = this.state;
        this.setState({
            isAddFunctionModalOpen: !isAddFunctionModalOpen
        });
    };

    _addFunction = () => {
        if (this.state.newFn.name.length > 0 && this.state.newFn.type.length > 0) {
            this.context.add(this.state.newFn);
            this.setState(INITIAL_STATE);
        }
    };

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                    <p>Add functions you wish to use in the editor.</p>
                    <FunctionsContext.Consumer>
                        {fc => <div className="animated fadeIn">
                            <div className="mb-4">
                                <Button color="primary" onClick={this._toggleAddFunctionModal}><span className="cil-plus"></span> Add Function</Button>
                            </div>
                            <Card>
                                {fc.isLoading ? "Loading" : null}
                                <Table hover striped borderless>
                                    <thead>
                                    <tr>
                                        <th>Identifier</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Provider</th>
                                        {/* <th>URL</th> */}
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {fc.functions.map(fn => <tr key={fn.id}>
                                            <td>{fn.id}</td>
                                            <td>{fn.name}</td>
                                            <td><Badge color="secondary">{fn.type}</Badge></td>
                                            <td>
                                                <a title={PROVIDERS[fn.provider]?.name} className="text-lg">
                                                    <span className={PROVIDERS[fn.provider]?.icon + " font-2xl"}></span>
                                                </a>
                                            </td>
                                            {/*<td>{fn.url}</td>*/}
                                            <td><Button color="dark"
                                                        onClick={() => confirm('Really delete ?') ? fc.remove(fn.id) : null}>
                                                <span className="cil-trash"></span>
                                            </Button>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Card>
                            <Modal isOpen={this.state.isAddFunctionModalOpen} size="lg">
                                <ModalHeader toggle={this._toggleAddFunctionModal}>Add Function</ModalHeader>
                                <ModalBody>
                                    <Form>
                                        <FormGroup>
                                            <Row>
                                                <Col xs="8">
                                                    <Label>Name</Label>
                                                    <Input value={this.state.newFn.name} onChange={e => this.setState({newFn: {...this.state.newFn, name: e.target.value}})} />
                                                </Col>
                                                <Col xs="4">
                                                    <Label>Type</Label>
                                                    <Input value={this.state.newFn.type} onChange={e => this.setState({newFn: {...this.state.newFn, type: e.target.value}})}>
                                                    </Input>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup>
                                            <Row>
                                                <Col xs="4">
                                                    <Label>Provider</Label>
                                                    <Input value={this.state.newFn.provider} type="select" onChange={e => this.setState({newFn: {...this.state.newFn, provider: e.target.value}})}>
                                                        <option key="none"></option>
                                                        {Object.keys(PROVIDERS).map(providerId => <option key={providerId} value={providerId}>{PROVIDERS[providerId].name}</option> )}
                                                    </Input>
                                                </Col>
                                                <Col xs="8">
                                                    <Label>URL</Label>
                                                    <Input value={this.state.newFn.url} onChange={e => this.setState({newFn: {...this.state.newFn, url: e.target.value}})} />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this._addFunction}>Add</Button>{' '}
                                    <Button color="secondary" onClick={this._toggleAddFunctionModal}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </div>
                        }
                    </FunctionsContext.Consumer>
                </Container>
            </>
        );
    }
}

export default Functions;