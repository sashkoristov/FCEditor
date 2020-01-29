import React from 'react';
import { Row, Col, Card, CardTitle, FormGroup, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Button } from 'reactstrap';

import Properties from './Properties';
import Constraints from './Constraints';

import * as afcl from '../../afcl';

class DataInsProperties extends React.Component {
    render() {
        return <>
            <Row className="mb-1 no-gutters">
                <Col>
                    <FormGroup check inline>
                        <Label check className="small mt-2">
                            <Input type="checkbox" checked={this.props.obj.getPassing()} onChange={e => this.props.changeHandler('dataIns', this.props.index, 'passing', !this.props.obj.getPassing())} /> Passing
                        </Label>
                    </FormGroup>
                </Col>
                <Col>
                    <div className="text-right"><Button size="sm" color="danger" onClick={() => this.props.removeHandler('dataIns', this.props.index)}><span className="cil-minus"></span></Button></div>
                </Col>
            </Row>
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
                <Properties parentObj={this.props.obj} />
            </Card>
            <Card className="my-2 p-2">
                <CardTitle className="font-weight-bold text-muted text-uppercase small mb-2">Constraints</CardTitle>
                <Constraints parentObj={this.props.obj} />
            </Card>
        </>;
    }
}

export default DataInsProperties;