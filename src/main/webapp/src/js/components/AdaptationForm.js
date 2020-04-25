import React from 'react';

import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

class AdaptationForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
        for (let name of this.props.toAdapt) {
            this.state[name] = [];
            this.state[name].push({from: 0, to: 1000, step: 1});
        }
    }

    _onNumberDividesChange = (name, newVal) => {
        let newState = {...this.state};
        newState[name] = [];
        for (let i = 0; i < parseInt(newVal); i++) {
            newState[name].push({from: (i)*1000, to: (i+1)*1000, step: 1});
        }
        this.setState(newState);
    };

    _onDivideChange = (name, index, prop, newVal) => {
        if (newVal == '') {
            newVal = 0;
        }
        if (!isNaN(newVal)) {
            let newState = {...this.state};
            newState[name][index][prop] = parseInt(newVal);
            this.setState(newState);
        }
    };

    render() {
        if (Object.keys(this.state).length == 0) {
            return <>
                Nothing to adapt here.
            </>
        }
        return <>
            {Object.keys(this.state).map(name => <>
                    <h3>{name}</h3>
                    <Row>
                        <Col sm="2">
                            <Label>Number of divides</Label>
                            <Input value={this.state[name].length} type="select" onChange={(e) => this._onNumberDividesChange(name, e.target.value)}>
                                {[1,2,3,4,5,6,7,8].map(num => <option value={num}>{num}</option> )}
                            </Input>
                        </Col>
                        <Col>
                            <Card>
                                <CardBody>
                                    {this.state[name].map((d, i) => <>
                                            <Row>
                                                <Col sm="1">{i+1}</Col>
                                                <Col>From <Input value={d.from} onChange={(e) => this._onDivideChange(name, i, 'from', e.target.value )} /></Col>
                                                <Col>To <Input value={d.to} onChange={(e) => this._onDivideChange(name, i, 'to', e.target.value )} /></Col>
                                                <Col>Step <Input value={d.step} onChange={(e) => this._onDivideChange(name, i, 'step', e.target.value )} /></Col>
                                            </Row>
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
            <div className="text-right">
                <Button color="secondary" onClick={this.props.onCancel}>Cancel</Button>&nbsp;
                <Button color="primary" onClick={() => this.props.onConfirm(this.state)}>Do it!</Button>{' '}
            </div>
        </>
    }
}

export default AdaptationForm;
