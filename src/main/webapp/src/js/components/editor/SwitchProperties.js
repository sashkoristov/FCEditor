/**
 * Switch Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, Form, FormGroup, Label, Input } from 'reactstrap';

import Properties from './Properties';
import Constraints from './Constraints';

import { types } from '../../afcl';

class SwitchProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        prevProps.obj.setDataEval(this.state.dataEval);
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    componentWillUnmount() {
        this.props.obj.setDataEval(this.state.dataEval);
    }

    _handleDataEvalPropertyChange(prop, newVal) {
        this.props.obj.dataEval[prop] = newVal;
        this.setState(this.props.obj);
    }

    render() {
        return <>
                <CardTitle className="h5">Switch</CardTitle>
                <div className="mb-2">
                    <div className="font-weight-bold text-muted mb-2">Data Eval</div>
                    <Row className="no-gutters mb-1">
                        <Input size="sm" placeholder="Name" value={this.state.dataEval.getName()} onChange={e => this._handleDataEvalPropertyChange('name', e.target.value)} />
                    </Row>
                    <Row className="no-gutters mb-1">
                        <Input size="sm" type="select" placeholder="Type" value={this.state.dataEval.getType()} onChange={e => this._handleDataEvalPropertyChange('type', e.target.value)} >
                            <option value="">choose type</option>
                            {Object.keys(types).map(t => <option value={t}>{types[t]}</option>)}
                        </Input>
                    </Row>
                    <Row className="no-gutters mb-1">
                        <Input size="sm" placeholder="Source" value={this.state.dataEval.getSource()} onChange={e => this._handleDataEvalPropertyChange('source', e.target.value)} />
                    </Row>
                </div>
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

export default SwitchProperties;