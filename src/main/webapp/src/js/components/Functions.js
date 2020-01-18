import React from 'react';

import { Row, Col, Form, FormGroup, Label, Input, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FunctionsContext from '../context/FunctionsContext';

const INITIAL_STATE = {
    newFn: {
        name: '',
        type: '',
        provider: '',
        url: ''
    },
    isAddFunctionModalOpen: false
}

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
    }

    _addFunction = () => {
        if (this.state.newFn.name.length > 0 && this.state.newFn.type.length > 0) {
            this.context.add(this.state.newFn);
            this.setState(INITIAL_STATE);
        }
    }

    render() {
        return (
            <div className="animated fadeIn">
                <FunctionsContext.Consumer>
                    {fc => <div>
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
                                                <Input value={this.state.newFn.type} type="select" onChange={e => this.setState({newFn: {...this.state.newFn, type: e.target.value}})}>
                                                    <option></option>
                                                    <option value="void">None</option>
                                                    <option value="string">String</option>
                                                    <option value="number">Number</option>
                                                </Input>
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup>
                                        <Row>
                                            <Col xs="4">
                                                <Label>Provider</Label>
                                                <Input value={this.state.newFn.provider} type="select" onChange={e => this.setState({newFn: {...this.state.newFn, provider: e.target.value}})}>
                                                    <option></option>
                                                    <option value="AWS">AWS Lamda</option>
                                                    <option value="IBM">IBM Cloud</option>
                                                    <option value="AZURE">Microsoft Azure</option>
                                                    <option value="GOOGLE">Google Cloud</option>
                                                    <option value="WHISK">Apache OpenWhisk</option>
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
                                <Button color="primary" onClick={this._addFunction}>Add Fn</Button>{' '}
                                <Button color="secondary" onClick={this._toggleAddFunctionModal}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        <div className="mb-4">
                            <Button onClick={this._toggleAddFunctionModal}>Add Fn</Button>
                        </div>
                        <div>
                            {fc.isLoading ? "Loading" : null}
                            <Table hover striped>
                                <thead>
                                <tr>
                                    <th>Identifier</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Provider</th>
                                    <th>URL</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {fc.functions.map(fn => <tr>
                                        <td>{fn.id}</td>
                                        <td>{fn.name}</td>
                                        <td>{fn.type}</td>
                                        <td>{fn.provider}</td>
                                        <td>{fn.url}</td>
                                        <td><Button outline color="secondary"
                                                    onClick={() => confirm('Really delete ?') ? fc.remove(fn.id) : null}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    }
                </FunctionsContext.Consumer>
            </div>
        );
    }
}

export default Functions;