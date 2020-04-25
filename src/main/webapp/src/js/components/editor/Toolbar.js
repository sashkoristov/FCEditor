import React from 'react';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Badge } from 'reactstrap';

class Toolbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentZoom: 1
        }
    }

    render() {
        return <div className="graph-toolbar">
            <UncontrolledButtonDropdown className="mr-1" title="Zoom">
                <DropdownToggle caret>
                    <span className="cil-zoom mr-1" /> {this.state.currentZoom * 100}%
                    &nbsp;
                </DropdownToggle>
                <DropdownMenu className="small">
                    <DropdownItem onClick={() => this.props.editor._zoomTo(0.5) || this.setState({currentZoom: 0.5 })}>50%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(0.75) || this.setState({currentZoom: 0.75})}>75%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1.0) || this.setState({currentZoom: 1.0 })}>100%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1.25) || this.setState({currentZoom: 1.25 })}>125%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1.5) || this.setState({currentZoom: 1.5 })}>150%</DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
            <Button className="btn mx-1" onClick={this.props.editor._undo} title="Undo last change">
                <span className="cil cil-action-undo" />
                &nbsp;
            </Button>
            <Button className="btn mx-1" onClick={this.props.editor._redo} title="Redo last change">
                <span className="cil cil-action-redo" />
                &nbsp;
            </Button>
            <Button className="btn mx-1" onClick={this.props.editor._removeSelected} title="Remove selection">
                <span className="cil cil-trash" />
                &nbsp;
            </Button>
            |
            <Button className="btn mx-1" onClick={this.props.editor._doLayout} title="Perform Auto-Layout">
                <span className="cil-layers mr-1" />
                Layout
            </Button>
            <Button className="btn mx-1" onClick={this.props.editor._validateWorkflow} title="Validate">
                <span className="cil-reload mr-1" />
                Validate
            </Button>
            |
            <Button className="btn mx-1" onClick={this.props.editor._loadWorkflow} title="Load Workflow from file">
                <span className="cil-folder-open mr-1" />
                Load
            </Button>
            <UncontrolledButtonDropdown title="Save Workflow">
                <DropdownToggle caret>
                    <span className="cil-cloud-download mr-1" />
                    Save
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => this.props.editor._saveWorkflow('xml')}>XML<Badge color="secondary">GUI</Badge></DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._saveWorkflow('yaml')}>YAML</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._saveWorkflow('json')}>JSON</DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </div>
    }
}

export default Toolbar;