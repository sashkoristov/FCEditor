/**
 * ParallelFor Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, InputGroup, Label, Input, Button } from 'reactstrap';

import DataInsOuts from "./DataInsOuts";
import Properties from './Properties';
import Constraints from './Constraints';

import * as afcl from '../../afcl';

class ParallelForProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    _handleLoopCounterPropertyChange(prop, newVal) {
        this.props.obj.loopCounter[prop] = newVal;
        this.setState(this.props.obj);
    }

    render() {
        return <Card className="p-2">
                <CardTitle className="h5">ParallelFor</CardTitle>
                <div className="mb-3">
                    <div>Name: <i>{this.props.obj.getName()}</i></div>
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-2">Loop Counter</div>
                    <Row className="no-gutters mb-1">
                        <Input size="sm" type="select" placeholder="Type" value={this.state.loopCounter.getType()} onChange={e => this._handleLoopCounterPropertyChange('type', e.target.value)} >
                            <option value="">choose type</option>
                            {Object.keys(afcl.types).map(t => <option value={t}>{afcl.types[t]}</option>)}
                        </Input>
                    </Row>
                    <InputGroup size="sm" className="mt-2">
                        <Input size="sm" placeholder="From" value={this.state.loopCounter.getFrom()} onChange={e => this._handleLoopCounterPropertyChange('from', e.target.value)} />
                        <Input size="sm" placeholder="To" value={this.state.loopCounter.getTo()} onChange={e => this._handleLoopCounterPropertyChange('to', e.target.value)} />
                        <Input size="sm" placeholder="Step" value={this.state.loopCounter.getStep()} onChange={e => this._handleLoopCounterPropertyChange('step', e.target.value)} />
                    </InputGroup>
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Input data</div>
                    <DataInsOuts type="dataIns" parentObj={this.props.obj} />
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Output Data</div>
                    <DataInsOuts type="dataOuts" parentObj={this.props.obj} />
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Properties</div>
                    <Properties parentObj={this.props.obj} />
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Constraints</div>
                    <Constraints parentObj={this.props.obj} />
                </div>
            </Card>
    }

}

export default ParallelForProperties;