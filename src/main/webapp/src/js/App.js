import React from "react";
import { HashRouter, Route, Switch } from 'react-router-dom';

import Main from './components/Main';

class App extends React.Component {

    render() {
        return <HashRouter>
            <Switch>
                <Route path="/" name="Dashboard" component={Main} />
            </Switch>
        </HashRouter>
    }
}
export default App;