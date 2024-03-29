/**
 * Cell Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Card, CardTitle, Table, Button, Collapse, ModalHeader, ModalBody } from 'reactstrap';

import mxgraph from '../../mxgraph';
const {
    mxCodec,
    mxUtils
} = mxgraph;

class CellProperties extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            isCellDebugOpen: false
        };
    }

    _getCellXml() {
        const enc = new mxCodec(mxUtils.createXmlDocument());
        const xmlModel = enc.encode(this.props.cell);

        return mxUtils.getPrettyXml(xmlModel);
    }

    render() {
        let childVertices = this.props.cell.isVertex() ? this.props.cell.getChildren().filter(c => c.isVertex()) : [];
        return <Card className="p-2">
                <CardTitle className="h5">Cell</CardTitle>
                <div>
                    {typeof this.props.cell.getValue() == 'string' ? <div>Label: <i>{this.props.cell.getValue()}</i></div> : null}
                    <div>Id: <span className="badge badge-secondary">{this.props.cell.id}</span></div>
                    <div>{this.props.cell.isVertex() ? 'Vertex' : 'Edge'}: <span className="badge badge-secondary">true</span></div>
                    {typeof this.props.cell.getType == 'function' && this.props.cell.getType() != null && <div>Type: <span className="badge badge-secondary">{this.props.cell.getType()}</span></div>}
                    <div>Style: <span className="badge badge-secondary">{this.props.cell.getStyle()}</span></div>
                    {childVertices.length > 0 ? <div>Children: <span className="badge badge-secondary">{childVertices.length}</span></div> : null}
                </div>
                <div>
                    <Button size="sm" color="link" className="px-0" onClick={() => this.setState({isCellDebugOpen: !this.state.isCellDebugOpen})}>Debug Information</Button>
                    <Collapse isOpen={this.state.isCellDebugOpen}>
                        <pre>
                            {this.state.isCellDebugOpen && this._getCellXml()}
                        </pre>
                    </Collapse>
                </div>
            </Card>
    }

}

export default CellProperties;