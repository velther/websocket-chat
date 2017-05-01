import React from 'react';
import { render } from 'react-dom';
import Router from 'universal-router';

import routes from './routes';
import Root from './components/Root';

const router = new Router(routes);
const appRootNode = document.getElementById('app-root');

/**
 * Application renderer
 */
export default async function bootstrap({ pathname }) {
    const route = await router.resolve({ path: pathname });

    const App = (
        <Root>
            {route}
        </Root>
    );

    render(App, appRootNode);
}
