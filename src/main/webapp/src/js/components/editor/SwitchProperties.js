/**
 * Switch Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';

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

    render() {
        return <>
                <div className="font-weight-bold mb-1">Switch</div>
                <Form>
                    <div className="font-weight-bold text-muted text-uppercase small mb-1">Data Eval</div>
                    <div className="mb-1">
                        <Input size="sm" placeholder="Name" value={this.state.dataEval.name} onChange={e => this.setState({dataEval: {...this.state.dataEval, name: e.target.value}})} />
                    </div>
                    <div className="mb-1">
                        <Input size="sm" type="select" placeholder="Type" value={this.state.dataEval.type} onChange={e => this.setState({dataEval: {...this.state.dataEval, type: e.target.value}})}>
                            <option></option>
                            {Object.keys(types).map(t => <option value={t}>{types[t]}</option>)}
                        </Input>
                    </div>
                    <div className="mb-1">
                        <Input size="sm" placeholder="Source" value={this.state.dataEval.source} onChange={e => this.setState({dataEval: {...this.state.dataEval, source: e.target.value}})} />
                    </div>
                </Form>
            </>
    }

}

export default SwitchProperties;