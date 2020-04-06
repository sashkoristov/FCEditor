import React from 'react';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Badge } from 'reactstrap';

class Toolbar extends React.Component {

    render() {
        return <div className="graph-toolbar">
            <UncontrolledButtonDropdown className="mr-1">
                <DropdownToggle caret>
                    <span className="cil-zoom mr-1" />
                    Zoom
                </DropdownToggle>
                <DropdownMenu className="small">
                    <DropdownItem onClick={() => this.props.editor._zoomTo(0.5)}>50%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(0.75)}>75%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1)}>100%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1.25)}>125%</DropdownItem>
                    <DropdownItem onClick={() => this.props.editor._zoomTo(1.5)}>150%</DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
            <Button className="btn mx-1" onClick={this.props.editor._undo}>
                <span className="cil cil-action-undo" />
                Undo
            </Button>
            <Button className="btn mx-1" onClick={this.props.editor._redo}>
                <span className="cil cil-action-redo" />
                Redo
            </Button>
            <Button className="btn mx-1" onClick={this.props.editor._removeSelected}>
                <span className="cil cil-trash" />
                Delete
            </Button>
            <Button className="btn mx-2" onClick={this.props.editor._validateGraph}>
                <span className="cil-reload mr-1" />
                Validate
            </Button>
            |
            <Button className="btn mx-2" onClick={this.props.editor._loadWorkflow}>
                <span className="cil-folder-open mr-1" />
                Load
            </Button>
            <UncontrolledButtonDropdown>
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