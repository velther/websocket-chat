import React from 'react';

import App from './components/App';
import Login from './components/Login';

export default {
    path: '/',
    async action({ next }) {
        // wait for child route resolve
        const route = await next();

        return <App>{route}</App>;
    },
    children: [
        {
            path: '/',
            action: () => <Login />
        }
    ]
};
