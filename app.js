import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';

import ChatServer from './server';
import requestMw from './middleware/request';

const PORT = process.env.port || 8080;
const app = new Koa();

app.use(requestMw);

// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/app/static/favicon.ico'));
app.use(serve(path.join(__dirname, 'public')));
app.use(serve(path.join(__dirname, 'client', 'js')));
// app.use('/', express.static(__dirname + '/public'));
// app.use('/', express.static(__dirname + '/client/js'));

// app.get('/', (req, res) => {
//     res.render('index');
// });

const server = app
    .listen(PORT, function() {
        console.log('Koa server listening on port ' + server.address().port);
    })
    .on('error', function(err) {
        if (err.code === 'EACCES') {
            console.log(`Error: port ${PORT} is already in use. Choose another one.`);
        } else {
            console.log('Error: ', err);
        }
        process.exit(1);
    });

new ChatServer();

export default app;
