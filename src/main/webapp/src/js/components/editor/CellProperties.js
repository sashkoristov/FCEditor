/**
 * Cell Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';
import { CardTitle } from 'reactstrap';

class CellProperties extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let childVerticesCount = this.props.cell.isVertex() ? this.props.cell.getChildren()?.filter(c => c.isVertex()) : 0;
        return <div>
                <CardTitle className="h5">Cell</CardTitle>
                <div>Id: {this.props.cell.id}</div>
                <div>{this.props.cell.isVertex() ? 'Vertex: true' : 'Edge: true'}</div>
                <div>{childVerticesCount > 0 ? 'Children: ' + childVerticesCount : null}</div>
            </div>
    }

}

export default CellProperties;