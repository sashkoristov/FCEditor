import React from 'react';
import { Form, Input, Label, Button } from 'reactstrap';

class FileUpload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null
        };
    }

    _onChange = (e) => {
        this.setState({
            file: e.target.files[0]
        });
        this.props.onSelect?.(e.target.files[0]);
    };

    render() {
        return <Form>
            <div className="custom-file-upload btn btn-secondary">
                <Label for="fileUpload">Load Workflow</Label>
                <Input type="file" id="fileUpload" className="d-none" onChange={this._onChange} />
            </div>
        </Form>
    }

}

export default FileUpload;