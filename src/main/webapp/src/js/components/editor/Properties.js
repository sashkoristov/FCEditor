import React from 'react';
import { Row, Col, Card, CartTitle, InputGroup, InputGroupAddon, InputGroupText, Input, Label, Button } from 'reactstrap';

class Properties extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newProperty: {
                name: '',
                value: ''
            }
        }
    }

    _addProperty = () => {
        this.props.parentObj.addProperty(this.state.newProperty);
        this.setState({
            newProperty: {
                name: '',
                value: ''
            }
        });
    };

    _setProperty = (index, prop) => {
        this.props.parentObj.setProperty(index, prop);
        this.forceUpdate();
    };

    _removeProperty = (index) => {
        this.props.parentObj.removeProperty(index);
        this.forceUpdate();
    };

    render() {
        return <>
            {this.props.parentObj.getProperties().map((prop, index) => <>
                <InputGroup size="sm">
                    <InputGroupAddon addonType="prepend" className="col-5 px-0">
                        <InputGroupText className="w-100 d-block text-truncate">{prop.name}</InputGroupText>
                    </InputGroupAddon>
                    <Input value={prop.value} onChange={e => this._setProperty(index, {...prop, value: e.target.value})} />
                    <InputGroupAddon addonType="append">
                        <Button onClick={() => this._removeProperty(index)}><span className="cil-minus"></span></Button>
                    </InputGroupAddon>
                </InputGroup>
            </>)}
            <InputGroup size="sm" className="mt-2">
                <Input placeholder="name" className="col-5" value={this.state.newProperty.name} onChange={e => this.setState({newProperty: {...this.state.newProperty, name: e.target.value}})} />
                <Input placeholder="value" value={this.state.newProperty.value} onChange={e => this.setState({newProperty: {...this.state.newProperty, value: e.target.value}})} />
                <InputGroupAddon addonType="append"><Button disabled={this.state.newProperty.name.length == 0 || this.props.parentObj.getPropertyByName(this.state.newProperty.name)} onClick={this._addProperty}><span className="cil-plus"></span></Button></InputGroupAddon>
            </InputGroup>
        </>
    }
}

export default Properties;