import React from "react";
import { HashRouter, Route, Switch } from 'react-router-dom';

import Main from './components/Main';

class App extends React.Component {

    render() {
        return <HashRouter>
            <Main />
        </HashRouter>
    }
}
export default App;