import React from 'react';

import settings from '../settings';

const storageKey = 'afcl_toolkit__settings';

const AppContext = React.createContext();

export class AppContextProvider extends React.Component {

    state = {
        settings: settings
    };

    componentDidMount() {
        let loadedSettings = JSON.parse(localStorage.getItem(storageKey)) || {};
        this.setState({
            settings: {...settings, ...loadedSettings}
        });
    }

    _setSetting = (key, value) => {
        const {settings} = this.state;
        settings[key] = value;
        this.setState({
            settings: settings
        }, () => {
            localStorage.setItem(storageKey, JSON.stringify(this.state.settings));
        });
    };

    _setSettings = (obj) => {
        this.setState({
            settings: {...this.state.settings, ...obj}
        }, () => {
            localStorage.setItem(storageKey, JSON.stringify(this.state.settings))
        });
    };

    render() {
        return (
            <AppContext.Provider value={{...this.state, setSetting: this._setSetting, setSettings: this._setSettings}}>
                {this.props.children}
            </AppContext.Provider>
        );
    }

};

export default AppContext;