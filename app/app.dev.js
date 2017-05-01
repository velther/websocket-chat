import history from './lib/history';
import bootstrap from './app';

bootstrap(history.location);
history.listen(bootstrap);

if (module.hot) {
    module.hot.accept('./routes', () => bootstrap(history.location));
}
