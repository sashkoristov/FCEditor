import React from 'react';

import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container, Nav, NavItem, NavTitle, NavLink, Badge, DropdownToggle, DropdownMenu } from 'reactstrap';

import {
    AppFooter,
    AppHeader,
    AppHeaderDropdown,
    AppNavbarBrand,
    AppBreadcrumb,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppSidebarNav as AppSidebarNav,
    AppSidebarToggler,
} from '@coreui/react';

// sidebar nav config
import navigation from '../navigation.js';

// routes config
import routes from '../routes.js';

import WorkflowEditor from './WorkflowEditor';

class Main extends React.Component {

    render() {
        return (
            <div className="app">
                <AppHeader fixed>
                    <AppSidebarToggler className="d-lg-none" display="md" mobile/>
                    <AppNavbarBrand>Serverless</AppNavbarBrand>
                    {/*<Nav className="ml-auto" navbar>
                        <NavItem className="d-md-down-none">
                            <NavLink href="#"><i className="fa fa-bell icons font-xl d-block"></i><Badge pill
                                                                                                       color="danger">5</Badge></NavLink>
                        </NavItem>
                        <NavItem className="d-md-down-none">
                            <NavLink href="#"><i className="fa fa-list icons font-xl d-block"></i></NavLink>
                        </NavItem>
                        <NavItem className="d-md-down-none">
                            <NavLink href="#"><i className="fa fa-map-pin icons font-xl d-block"></i></NavLink>
                        </NavItem>
                        <AppHeaderDropdown>
                            <DropdownToggle nav>
                                asd
                            </DropdownToggle>
                            <DropdownMenu right style={{height: '400px'}}>
                                AppHeaderDropdown
                            </DropdownMenu>
                        </AppHeaderDropdown>
                    </Nav>*/}
                </AppHeader>
                <div className="app-body">
                    <AppSidebar fixed display="lg">
                        <AppSidebarHeader/>
                        <AppSidebarForm/>
                        <AppSidebarNav navConfig={navigation} {...this.props} router={router}/>
                        <AppSidebarFooter/>
                        <AppSidebarMinimizer/>
                    </AppSidebar>
                    <main className="main">
                        <AppBreadcrumb appRoutes={routes} router={router}/>
                        <Container fluid>
                            <Switch>
                                {routes.map((route, idx) => {
                                        return route.component ? (
                                                <Route key={idx} path={route.path} exact={route.exact} name={route.name}
                                                       render={props => (
                                                           <route.component {...props} />
                                                       )}/>)
                                            : (null);
                                    },
                                )}
                                <Redirect from="/" to="/dashboard"/>
                            </Switch>
                        </Container>
                    </main>
                </div>
                <AppFooter>
                    <span><a href="https://coreui.io">CoreUI</a> &copy; 2019 creativeLabs</span>
                    <span className="ml-auto">Powered by <a href="https://coreui.io/react">CoreUI for React</a></span>
                </AppFooter>
            </div>
        )
    }
}

export default Main;