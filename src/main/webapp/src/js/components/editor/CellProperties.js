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
        return <div>
                <CardTitle className="h5">Cell</CardTitle>
                <div>Id: {this.props.cell.id}</div>
                <div>{this.props.cell.isVertex() ? 'Vertex: true' : 'Edge: true'}</div>
            </div>
    }

}

export default CellProperties;