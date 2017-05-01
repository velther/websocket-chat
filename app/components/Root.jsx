import { Component } from 'react';
import PropTypes from 'prop-types';

import ApiClient from '../api';
import Actions from '../actions';

export default class Root extends Component {
    static childContextTypes = {
        apiClient: PropTypes.object,
        actions: PropTypes.object
    };

    getChildContext () {
        return {
            apiClient: new ApiClient('ws://localhost:8081'),
            actions: new Actions(this.apiClient)
        };
    }

    render () {
        const { children } = this.props;
        return children || null
    }
}
