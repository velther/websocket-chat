import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import cn from 'classnames';
import s from './Login.styl';

import * as actions from '../actions/actions';

export default class Login extends Component {
    state = { userName: '' };

    render() {
        return (
            <form className={s.Login} onSubmit={this.handleLoginSumbit}>
                <label>
                    <div className={s.Text}>Name</div>
                    <input className={cn(s.Control, s.Input)} value={this.state.userName} onChange={this.handleUserNameChange} />
                    <button className={cn(s.Control, s.Button)}>Enter</button>
                </label>
            </form>
        );
    }

    handleUserNameChange = (event) => {
        this.setState({ userName: event.target.value });
    };

    handleLoginSumbit = (event) => {
        event.preventDefault();

        actions.login(this.state.userName);
        // chatSocket.send(JSON.stringify({type: 'login', name: userName}));
    }
}
