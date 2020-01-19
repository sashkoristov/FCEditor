/**
 * IfThenElse Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';

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

    _addConditionItem = () => {
        let tmpState = {...this.state};
        tmpState.condition.conditions.push({
            data1: '',
            data2: '',
            operator: '',
            negation: false
        });
        this.setState(tmpState);
    }

    _removeConditionItem = (index) => {
        let tmpState = {...this.state};
        tmpState.condition.conditions.splice(index, 1);
        this.setState(tmpState);
    }

    _handleConditionItemChange = (index, prop, newVal) => {
        let tmpState = {...this.state};
        tmpState.condition.conditions[index][prop] = newVal;
        this.setState(tmpState);
    }

    _toggleConditionItemValue = (index, prop) => {
        let tmpState = {...this.state};
        tmpState.condition.conditions[index][prop] = !tmpState.condition.conditions[index][prop];
        this.setState(tmpState);
    }

    render() {
        return <>
                <div className="font-weight-bold mb-1">IfThenElse</div>
                <Form>
                    <div className="font-weight-bold text-muted text-uppercase small mb-1">Condition</div>
                    <FormGroup>
                        <Input size="sm" placeholder="Combined with" value={this.state.condition.combinedWith} onChange={e => this.setState({condition: {...this.state.condition, combinedWith: e.target.value}})} />
                    </FormGroup>
                    <div className="font-weight-bold text-muted text-uppercase small mb-1">Conditions</div>
                    {this.state.condition.conditions.map((condition, index) => <>
                            <div className="text-right"><a onClick={() => this._removeConditionItem(index)}><span className="cil-x"></span></a></div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="Data 1" value={condition.data1} onChange={e => this._handleConditionItemChange(index, 'data1', e.target.value)} />
                            </div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="Data 2" value={condition.data2} onChange={e => this._handleConditionItemChange(index, 'data2', e.target.value)} />
                            </div>
                            <div className="mb-1">
                                <Input size="sm" placeholder="Operator" value={condition.operator} onChange={e => this._handleConditionItemChange(index, 'operator', e.target.value)} />
                            </div>
                            <FormGroup check inline>
                                <Label check>
                                    <Input type="checkbox" checked={condition.negation} onChange={e => this._toggleConditionItemValue(index, 'negation')} /> Negation
                                </Label>
                            </FormGroup>
                            <hr/>
                        </>
                    )}
                    <Button onClick={this._addConditionItem} size="sm"><span className="cil-plus"></span></Button>
                </Form>
            </>
    }

}

export default IfThenElseProperties;