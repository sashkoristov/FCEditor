import React from 'react';
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
                            <CardLink href="#/editor">Go to Editor</CardLink>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card className="animated fadeIn">
                        <CardHeader>Function Repository</CardHeader>
                        <CardBody>
                            <CardText>This is the body blah blah</CardText>
                            <CardLink href="#/functions">Go to Functions</CardLink>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        )
    }
}

export default Dashboard;