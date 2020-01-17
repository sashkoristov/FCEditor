/**
 * Cell Properties Component
 *
 * @author Ben Walch, 2020
 */

import React from 'react';

class CellProperties extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return <div>
                <div><strong>Cell</strong></div>
                <div>Id: {this.props.cell.id}</div>
                <div>{this.props.cell.isVertex() ? 'Vertex: true' : 'Edge: true'}</div>
            </div>
    }

}

export default CellProperties;