import React, { Component } from 'react';
import PropTypes from 'prop-types';
import s from './App.styl';

export default class App extends Component {
    render() {
        return (
            <div className={s.App}>
                {this.props.children}
            </div>
        );
    }

    static propTypes = {
        children: PropTypes.element.isRequired
    }
}
