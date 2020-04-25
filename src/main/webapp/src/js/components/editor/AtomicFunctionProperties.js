/**
 * Function Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Container, Row, Col, Card, CardTitle, Label, Button, Badge } from 'reactstrap';

import DataInsOuts from './DataInsOuts';
import Properties from './Properties';
import Constraints from './Constraints';

class AtomicFunctionProperties extends React.Component {

    constructor(props) {
        super(props);

        this.state = props.obj;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.obj != this.props.obj) {
            this.setState(this.props.obj);
        }
    }

    render() {
        return <Card className="p-2">
                <CardTitle className="h5">AtomicFunction</CardTitle>
                <div className="mb-3">
                    <div>Name: <i>{this.props.obj.getName()}</i></div>
                    <div>Type: <Badge>{this.props.obj.getType()}</Badge></div>
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

export default AtomicFunctionProperties;