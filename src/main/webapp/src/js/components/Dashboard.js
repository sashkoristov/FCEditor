import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardHeader, CardBody, CardText, CardLink } from 'reactstrap';

class Dashboard extends React.Component {

    render() {
        return (
            <Row>
                <Col sm="6">
                    <Card className="animated fadeIn">
                        <CardHeader>Editor</CardHeader>
                        <CardBody>
                            <CardText>This is the body blah blah</CardText>
                            <Link to="/editor" className="card-link">Go to Editor</Link>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card className="animated fadeIn">
                        <CardHeader>Function Repository</CardHeader>
                        <CardBody>
                            <CardText>This is the body blah blah</CardText>
                            <Link to="/functions" className="card-link">Go to Functions</Link>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        )
    }
}

export default Dashboard;