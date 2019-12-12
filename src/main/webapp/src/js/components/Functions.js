import React from 'react';

import {InputGroup, InputGroupAddon, Button, Input, Table} from 'reactstrap';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FunctionsContext from '../context/FunctionsContext';

class Functions extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newFnName: ''
        };
    }

    render() {
        return (
            <div className="animated fadeIn">
                <FunctionsContext.Consumer>
                    {fc => <div>
                        <div className="mb-4">
                            <InputGroup className="col-4">
                                <Input value={this.state.newFnName}
                                       onChange={e => this.setState({newFnName: e.target.value})}/>
                                <InputGroupAddon addonType="append">
                                    <Button
                                        onClick={() => {
                                            if (this.state.newFnName.length > 0) {
                                                fc.add(this.state.newFnName);
                                                this.setState({newFnName: ''});
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
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {fc.functions.map(fn => <tr>
                                        <td>{fn.id}</td>
                                        <td>{fn.name}</td>
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