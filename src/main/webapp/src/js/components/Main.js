import React from 'react';

import { Redirect, Route, Switch} from 'react-router-dom';
import * as router from 'react-router-dom';

import { Button } from 'reactstrap';

import {
    AppHeader,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppSidebarNav,
    AppSidebarToggler,
} from '@coreui/react';

import LayoutHelper from '@coreui/react/es/Shared/layout/layout';

// sidebar nav config
import navigation from '../navigation.js';

// routes config
import routes from '../routes.js';

import AppContext, { AppContextProvider } from "../context/AppContext";
import { FunctionsContextProvider } from "../context/FunctionsContext";

class Main extends React.Component {

    render() {
        return (
            <div className="app">
                <AppContextProvider>
                    <AppContext.Consumer>
                        {appContext => {
                            LayoutHelper.sidebarToggle(appContext.settings.ui.sidebarCollapsed);
                            return <>
                                <AppHeader fixed>
                                    <AppSidebarToggler className="d-lg-none" display="md" mobile/>
                                    <a className="navbar-brand">
                                        <div className="navbar-brand-full font-weight-bold"><span className="navbar-brand-full__primary">AFCL</span><span className="navbar-brand-full__secondary text-primary">Toolkit</span></div>
                                        <div className="navbar-brand-minimized font-weight-bold small">AFCL</div>
                                    </a>
                                </AppHeader>
                                <div className="app-body">
                                    <AppSidebar fixed display="lg" minimized={appContext.settings.ui.sidebarCollapsed}>
                                        <AppSidebarHeader/>
                                        <AppSidebarForm/>
                                        <AppSidebarNav navConfig={navigation} {...this.props} router={router}/>
                                        <AppSidebarFooter/>
                                        <Button className="sidebar-minimizer mt-auto" onClick={e => appContext.setSettings({ ui: { sidebarCollapsed: !appContext.settings.ui.sidebarCollapsed }})}/>
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
                            </>
                        }
                        }
                    </AppContext.Consumer>
                </AppContextProvider>
            </div>
        )
    }
}

export default Main;