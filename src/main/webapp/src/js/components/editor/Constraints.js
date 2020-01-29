import React from 'react';
import { Row, Col, Card, CartTitle, InputGroup, InputGroupAddon, InputGroupText, Input, Label, Button } from 'reactstrap';

class Constraints extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newConstraint: {
                name: '',
                value: ''
            }
        }
    }

    _addConstraint = () => {
        this.props.parentObj.addConstraint(this.state.newConstraint);
        this.setState({
            newConstraint: {
                name: '',
                value: ''
            }
        });
    }

    _setConstraint = (index, prop) => {
        this.props.parentObj.setConstraint(index, prop);
        this.forceUpdate();
    }

    _removeConstraint = (index) => {
        this.props.parentObj.removeConstraint(index);
        this.forceUpdate();
    }

    render() {
        return <>
            {this.props.parentObj.getConstraints().map((prop, index) => <>
                <InputGroup size="sm">
                    <InputGroupAddon addonType="prepend" className="col-5 px-0">
                        <InputGroupText className="w-100 d-block text-truncate">{prop.name}</InputGroupText>
                    </InputGroupAddon>
                    <Input value={prop.value} onChange={e => this._setConstraint(index, {...prop, value: e.target.value})} />
                    <InputGroupAddon addonType="append">
                        <Button onClick={() => this._removeConstraint(index)}><span className="cil-minus"></span></Button>
                    </InputGroupAddon>
                </InputGroup>
            </>)}
            <InputGroup size="sm" className="mt-2">
                <Input placeholder="name" className="col-5" value={this.state.newConstraint.name} onChange={e => this.setState({newConstraint: {...this.state.newConstraint, name: e.target.value}})} />
                <Input placeholder="value" value={this.state.newConstraint.value} onChange={e => this.setState({newConstraint: {...this.state.newConstraint, value: e.target.value}})} />
                <InputGroupAddon addonType="append"><Button disabled={this.state.newConstraint.name.length == 0 || this.props.parentObj.getConstraintByName(this.state.newConstraint.name)} onClick={this._addConstraint}><span className="cil-plus"></span></Button></InputGroupAddon>
            </InputGroup>
        </>
    }
}

export default Constraints;