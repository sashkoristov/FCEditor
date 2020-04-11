import React from 'react';
import { Container, Row, Col, Card, CardTitle, Label, Button, Badge } from 'reactstrap';

import DataInsProperties from './DataInsProperties';
import DataOutsProperties from './DataOutsProperties';

import * as utils from '../../utils';
import * as afcl from '../../afcl';

class DataInsOuts extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newProperty: {
                name: '',
                value: ''
            }
        }
    }

    _handleDataItemChange = (type, index, prop, newVal) => {
        this.props.parentObj[type][index][prop] = newVal;
        this.forceUpdate();
    };

    _addDataItem = () => {
        let className = utils.capitalize(this.props.type);
        this.props.parentObj[this.props.type].push(new afcl.objects[className]());
        this.forceUpdate();
    };

    _removeDataItem = (type, index) => {
        this.props.parentObj[this.props.type].splice(index,1);
        this.forceUpdate();
    };

    render() {
        return <>
            {this.props.parentObj[this.props.type].map((dataItem, index) => <>
                {this.props.type == 'dataIns'
                    ? <DataInsProperties obj={dataItem} index={index} changeHandler={this._handleDataItemChange}
                                         removeHandler={this._removeDataItem} key={this.props.type + '-' + index}/>
                    : <DataOutsProperties obj={dataItem} index={index} changeHandler={this._handleDataItemChange}
                                         removeHandler={this._removeDataItem} key={this.props.type + '-' + index}/>
                }
                <hr />
            </>
            )}
            <Button color="primary" onClick={this._addDataItem} size="sm"><span className="cil-plus"></span></Button>
        </>
    }
}

export default DataInsOuts;