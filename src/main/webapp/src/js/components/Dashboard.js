import React from 'react';
import {Link, default as router} from 'react-router-dom';
import {Container, Row, Col, Card, CardHeader, CardBody, CardText, Button} from 'reactstrap';
import {AppBreadcrumb} from "@coreui/react";
import routes from "../routes";

class Dashboard extends React.Component {

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                        <Card className="animated fadeIn">
                            <CardBody>
                                <h1 className="display-4">AFCL Toolkit</h1>
                                <p className="lead">This page is an overview of the features of the AFCL Toolkit.</p>
                                <hr className="mb-3"/>
                                <p><b>ACFL</b> stands for 'Abstract Function Choreography Language' and is developed to standardize the
                                    specification of serverless function workflows.<br />
                                    Learn more about AFCL in the <a href="http://dps.uibk.ac.at/projects/afcl/" target="_blank">documentation</a>.
                                </p><p>
                                The AFCL Toolkit is built to simplify the process of composing serverless function
                                workflows. See the widgets below to learn more about the modules in this application.
                            </p>
                        </CardBody>
                    </Card>
                    <Row>
                        <Col sm="4" className="d-flex">
                            <Card className="animated fadeIn w-100">
                                <CardHeader><span className="cil-functions mr-2"></span> Functions</CardHeader>
                                <CardBody>
                                    <CardText>This is the place where you can add the functions you want to use in the editor when composing a workflow.</CardText>
                                    <Link to="/functions" className="card-link btn btn-primary">Go to Functions</Link>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col sm="4" className="d-flex">
                            <Card className="animated fadeIn w-100">
                                <CardHeader><span className="cil-browser mr-2"></span> Editor</CardHeader>
                                <CardBody>
                                    <CardText>Composing workflows was never easier!<br />Use the intuitive editor to compose your workflow.</CardText>
                                    <Link to="/editor" className="card-link btn btn-primary">Go to Editor</Link>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col sm="4" className="d-flex">
                            <Card className="animated fadeIn w-100">
                                <CardHeader><span className="cil-cog mr-2"></span> Settings</CardHeader>
                                <CardBody>
                                    <CardText>Here you can specify application-wide constants. Limits and quotas of FaaS providers are stored here.</CardText>
                                    <Link to="/settings" className="card-link btn btn-primary">Go to Settings</Link>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        )
    }
}

export default Dashboard;