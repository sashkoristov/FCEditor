/**
 * Cell Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { Card, CardTitle, Table} from 'reactstrap';

class CellProperties extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let childVertices = this.props.cell.isVertex() ? this.props.cell.getChildren().filter(c => c.isVertex()) : [];
        return <Card className="p-2">
            <CardTitle className="h5">Cell</CardTitle>
            <Table size="sm" borderless={true} className="w-auto">
                <tbody>
                    <tr><td>Id</td><td><span className="badge badge-secondary">{this.props.cell.id}</span></td></tr>
                    <tr><td>{this.props.cell.isVertex() ? 'Vertex' : 'Edge'}</td><td><span className="badge badge-secondary">true</span></td></tr>
                    {childVertices.length > 0 ? <tr><td>Children</td><td><span className="badge badge-secondary">{childVertices.length}</span></td></tr> : null}
                    <tr><td>Style</td><td><span className="badge badge-secondary">{this.props.cell.getStyle()}</span></td></tr>
                    <tr><td>Geometry</td><td>{JSON.stringify(this.props.cell.getGeometry())}</td></tr>
                </tbody>
            </Table>
        </Card>
    }

}

export default CellProperties;