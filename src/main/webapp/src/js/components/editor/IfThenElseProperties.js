/**
 * IfThenElse Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, Form, FormGroup, Label, Input, Button } from 'reactstrap';

import Properties from './Properties';
import Constraints from './Constraints';

import * as afcl from '../../afcl';

class IfThenElseProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        prevProps.obj.setCondition(this.state.condition);
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    componentWillUnmount() {
        this.props.obj.setCondition(this.state.condition);
    }

    _handleConditionPropertyChange = (prop, newVal) => {
        this.props.obj.condition[prop] = newVal;
        this.setState(this.props.obj);
    }

    _addConditionItem = () => {
        this.props.obj.condition.addCondition(new afcl.objects.Condition());
        this.setState(this.props.obj);
    }

    _removeConditionItem = (index) => {
        this.props.obj.condition.removeCondition(index);
        this.setState(this.props.obj);
    }

    _handleConditionItemChange = (index, prop, newVal) => {
        this.props.obj.condition.conditions[index][prop] = newVal;
        this.setState(this.props.obj);
    }

    render() {
        return <>
                <CardTitle className="h5">IfThenElse</CardTitle>
                <div className="font-weight-bold text-muted mb-2">Condition</div>
                <div className="mb-2">
                    <Input type="select" size="sm" value={this.state.condition.getCombinedWith()} onChange={e => this._handleConditionPropertyChange('combinedWith', e.target.value)}>
                        <option value="">choose combined with...</option>
                        <option value="or">Or</option>
                        <option value="and">And</option>
                    </Input>
                </div>
                <Card className="my-2 p-2">
                    <CardTitle className="font-weight-bold text-muted text-uppercase small mb-2">Conditions</CardTitle>
                    {this.state.condition.getConditions().map((condition, index) => <>
                            <Row className="no-gutters mb-1">
                                <Col>
                                    <FormGroup check inline>
                                        <Label check className="small mt-2">
                                            <Input type="checkbox" checked={condition.getNegation()} onChange={e => this._handleConditionItemChange(index, 'negation', !condition.getNegation())} /> Negation
                                        </Label>
                                    </FormGroup>
                                </Col>
                                <Col>
                                    <div className="text-right"><Button color="danger" size="sm" onClick={() => this._removeConditionItem(index)}><span className="cil-minus"></span></Button></div>
                                </Col>
                            </Row>
                            <div className="mb-1">
                                <Input size="sm" placeholder="data 1" value={condition.getData1()} onChange={e => this._handleConditionItemChange(index, 'data1', e.target.value)} />
                            </div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="data 2" value={condition.getData2()} onChange={e => this._handleConditionItemChange(index, 'data2', e.target.value)} />
                            </div>
                            <div className="mb-1">
                                <Input type="select" size="sm" value={condition.getOperator()} onChange={e => this._handleConditionItemChange(index, 'operator', e.target.value)}>
                                    <option value="">operator</option>
                                    <option value="<">less than</option>
                                    <option value="<=">less than or equal</option>
                                    <option value="=">equal</option>
                                    <option value=">=">greater than or equal</option>
                                    <option value=">">greater than</option>
                                    <option value="contains">contains</option>
                                    <option value="startsWith">starts with</option>
                                    <option value="endsWith">ends with</option>
                                </Input>
                            </div>
                            <hr/>
                        </>
                    )}
                    <div>
                        <Button color="primary" onClick={this._addConditionItem} size="sm"><span className="cil-plus"></span></Button>
                    </div>
                </Card>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Properties</div>
                    <Properties parentObj={this.props.obj} />
                </div>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-1">Constraints</div>
                    <Constraints parentObj={this.props.obj} />
                </div>
            </>
    }

}

export default IfThenElseProperties;