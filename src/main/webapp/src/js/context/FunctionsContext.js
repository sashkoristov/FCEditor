import React from 'react';
import axios from 'axios';

const FunctionsContext = React.createContext();

const apiPath = 'api/function';

export class FunctionsContextProvider extends React.Component {

    state = {
        isLoading: true,
        functions: []
    };

    componentDidMount() {
        axios.get(apiPath)
            .then(response => {
                this.setState({
                    isLoading: false,
                    functions: response.data
                });
            });
    }

    render() {
        return (
            <FunctionsContext.Provider value={{...this.state, add: this._add, remove: this._remove }}>
                {this.props.children}
            </FunctionsContext.Provider>
        );
    }

    _add = (name) => {
        this.setState({ isLoading: true });
        axios.post(apiPath, { name: name })
            .then(response => {
                this.setState({
                    functions: [ response.data, ...this.state.functions ],
                })
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    };

    _remove = (id) => {
        this.setState({ isLoading: true });
        axios.delete(apiPath + '/' + id)
            .then(response => {
                this.setState({functions: this.state.functions.filter(fn => fn.id !== id)})
            })
            .finally(() => {
                this.setState({isLoading: false})
            });
    };

};

export default FunctionsContext;