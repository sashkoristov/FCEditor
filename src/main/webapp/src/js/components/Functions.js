import React from 'react';

import {InputGroup, InputGroupAddon, Button, Input, Table} from 'reactstrap';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FunctionsContext from '../context/FunctionsContext';

const INITIAL_STATE = {
    newFn: {
        name: '',
        type: ''
    }
}

class Functions extends React.Component {

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    render() {
        return (
            <div className="animated fadeIn w-100">
                <FunctionsContext.Consumer>
                    {fc => <div>
                        <div className="mb-4">
                            <InputGroup className="col-4">
                                <Input value={this.state.newFn.name}
                                    onChange={e => this.setState({newFn: {...this.state.newFn, name: e.target.value}})} />
                                <Input value={this.state.newFn.type} type="select"
                                    onChange={e => this.setState({newFn: {...this.state.newFn, type: e.target.value}})}>
                                    <option></option>
                                    <option value="void">None</option>
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                </Input>
                                <InputGroupAddon addonType="append">
                                    <Button
                                        onClick={() => {
                                            console.log(this.state);
                                            if (this.state.newFn.name.length > 0 && this.state.newFn.type.length > 0) {
                                                fc.add(this.state.newFn);
                                                this.setState(INITIAL_STATE);
                                            }
                                        }}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                        <div>
                            {fc.isLoading ? "Loading" : null}
                            <Table>
                                <thead>
                                <tr>
                                    <th>Identifier</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {fc.functions.map(fn => <tr>
                                        <td>{fn.id}</td>
                                        <td>{fn.name}</td>
                                        <td>{fn.type}</td>
                                        <td><Button color="danger"
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