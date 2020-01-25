import React from 'react';
import { Row, Col, Card, CardTitle, InputGroup, InputGroupAddon, InputGroupText, Input, Button } from 'reactstrap';

import * as afcl from '../../afcl';

class DataInsProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newProperty: {
                name: '',
                value: ''
            },
            newConstraint: {
                name: '',
                value: ''
            }
        };
    }

    _addProperty = () => {
        if (this.state.newProperty.name.length == 0) { return; }
        this.props.obj.addProperty(this.state.newProperty.name, this.state.newProperty.value);
        this.setState({
            newProperty: {
                name: '',
                value: ''
            }
        });
    }

    _setProperty = (index, property) => {
        this.props.obj.setProperty(index, property);
        this.forceUpdate();
    }

    _removeProperty = (index) => {
        this.props.obj.removeProperty(index);
        this.forceUpdate();
    }

    _addConstraint = () => {
        this.props.obj.addConstraint(this.state.newConstraint.name, this.state.newConstraint.value);
        this.setState({
            newConstraint: {
                name: '',
                value: ''
            }
        });
    }

    _setConstraint = (index, constraint) => {
        this.props.obj.setConstraint(index, constraint);
        this.forceUpdate();
    }

    _removeConstraint = (index) => {
        this.props.obj.removeConstraint(index);
        this.forceUpdate();
    }

    render() {
        return <>
            <Row className="mb-1 no-gutters">
                <Col className="pr-1">
                    <Input size="sm" placeholder="name" value={this.props.obj.getName()} onChange={e => this.props.changeHandler('dataIns', this.props.index, 'name', e.target.value)} />
                </Col>
                <Col>
                    <Input size="sm" type="select" placeholder="type" value={this.props.obj.getType()} onChange={e => this.props.changeHandler('dataIns', this.props.index, 'type', e.target.value)}>
                        <option value="">Choose type...</option>
                        {Object.keys(afcl.types).map(t => <option value={t}>{afcl.types[t]}</option>)}
                    </Input>
                </Col>
            </Row>
            <Row className="no-gutters mb-1">
                <InputGroup size="sm">
                    <Input size="sm" placeholder="value" className="col-4" disabled={this.props.obj.getSource() != ''} value={this.props.obj.getValue()} onChange={e => this.props.changeHandler('dataIns', this.props.index, 'value', e.target.value)} />
                    <div className="input-group-prepend input-group-append">
                        <div className="input-group-text">or</div>
                    </div>
                    <Input size="sm" placeholder="source" disabled={this.props.obj.getValue() != ''} value={this.props.obj.getSource()} onChange={e => this.props.changeHandler('dataIns', this.props.index, 'source', e.target.value)} />
                </InputGroup>
            </Row>
            <Card className="my-2 p-2">
                <CardTitle className="font-weight-bold text-muted text-uppercase small mb-2">Properties</CardTitle>
                {this.props.obj.getProperties().map((prop, index) => <>
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
                    <InputGroupAddon addonType="append"><Button disabled={this.state.newProperty.name.length == 0 || this.props.obj.getProperties().find(p => p.name == this.state.newProperty.name)} onClick={this._addProperty}><span className="cil-plus"></span></Button></InputGroupAddon>
                </InputGroup>
            </Card>
            <Card className="my-2 p-2">
                <CardTitle className="font-weight-bold text-muted text-uppercase small mb-2">Constraints</CardTitle>
                {this.props.obj.getConstraints().map((cstr, index) => <>
                    <InputGroup size="sm">
                        <InputGroupAddon addonType="prepend" className="col-5 px-0">
                            <InputGroupText className="w-100 d-block text-truncate">{cstr.name}</InputGroupText>
                        </InputGroupAddon>
                        <Input value={cstr.value} onChange={e => this._setConstraint(index, {...cstr, value: e.target.value})} />
                        <InputGroupAddon addonType="append">
                            <Button onClick={() => this._removeConstraint(index)}><span className="cil-minus"></span></Button>
                        </InputGroupAddon>
                    </InputGroup>
                </>)}
                <InputGroup size="sm" className="mt-2">
                    <Input placeholder="name" className="col-5" value={this.state.newConstraint.name} onChange={e => this.setState({newConstraint: {...this.state.newConstraint, name: e.target.value}})} />
                    <Input placeholder="value" value={this.state.newConstraint.value} onChange={e => this.setState({newConstraint: {...this.state.newConstraint, value: e.target.value}})} />
                    <InputGroupAddon addonType="append"><Button disabled={this.state.newConstraint.name.length == 0 || this.props.obj.getConstraints().find(c => c.name == this.state.newConstraint.name)} onClick={this._addConstraint}><span className="cil-plus"></span></Button></InputGroupAddon>
                </InputGroup>
            </Card>
        </>;
    }
}

export default DataInsProperties;