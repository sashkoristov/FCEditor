import React from 'react';
import { Container } from 'reactstrap';
import {AppBreadcrumb} from "@coreui/react";
import routes from "../routes";
import * as router from "react-router-dom";

class Settings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <AppBreadcrumb appRoutes={routes} router={router} />
                <Container fluid>
                    Settings
                </Container>
            </>
        )
    }

}

export default Settings;

/*
developer creates loop with 1000 iterations
inside the loop is collection with 10000 elements

with the language we will specify each 10 elements go to a function
first 10 go to f x, second 10 go to fn y

system should accept number 4 divides*/