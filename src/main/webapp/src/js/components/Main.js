import React from 'react';

import {Redirect, Route, Switch} from 'react-router-dom';
import * as router from 'react-router-dom';
import {Container, Nav, NavItem, NavTitle, NavLink, Badge, DropdownToggle, DropdownMenu} from 'reactstrap';

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
    AppSidebarNav,
    AppSidebarToggler,
} from '@coreui/react';

// sidebar nav config
import navigation from '../navigation.js';

// routes config
import routes from '../routes.js';

import { FunctionsContextProvider } from "../context/FunctionsContext";

class Main extends React.Component {

    render() {
        return (
            <div className="app">
                <AppHeader fixed>
                    <AppSidebarToggler className="d-lg-none" display="md" mobile/>
                    <a className="navbar-brand">
                        <div className="navbar-brand-full font-weight-bold"><span className="navbar-brand-full__primary">AFCL</span><span className="navbar-brand-full__secondary text-primary">Toolkit</span></div>
                        <div className="navbar-brand-minimized font-weight-bold small">AFCL</div>
                    </a>
                    {/*<AppNavbarBrand
                        full={{ src: '', width: 89, height: 25, alt: 'CoreUI Logo' }}
                        minimized={{ src: minimizedBrand, width: 30, height: 30, alt: 'CoreUI Logo' }}
                    />*/
                    }
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
                        <FunctionsContextProvider>
                            <Switch>
                                {routes.map((route, idx) => {
                                        return route.component ? (
                                            <Route key={idx} path={route.path} exact={route.exact} name={route.name}
                                                   render={props => (
                                                       <route.component {...props} />
                                                   )}/>
                                        ) : (null);
                                    },
                                )}
                                <Redirect from="/" to="/dashboard"/>
                            </Switch>
                        </FunctionsContextProvider>
                    </main>
                </div>
                <AppFooter>
                    <span className="ml-auto">Made with <span className="cil-heart"></span> and passion by Ben Walch, powered by <a href="https://coreui.io/react">CoreUI for React</a></span>
                </AppFooter>
            </div>
        )
    }
}

export default Main;