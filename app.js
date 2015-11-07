#!/usr/bin/env node

const PORT = 8080;

const express = require('express');
const wss = require('ws').Server;
// const _ = require('lodash');
// const favicon = require('serve-favicon');

const app = express();

app.disable('x-powered-by');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/app/static/favicon.ico'));
app.use('/', express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/client/js'));

app.get('/', (req, res) => {
    res.render('index');
});

const server = app
    .listen(PORT, () => {
        console.log('Express server listening on port ' + server.address().port);
    })
    .on('error', (err) => {
        if (err.code === 'EACCES') {
            console.log('Error: port %s is already in use. Choose another one.', port);
        } else {
            console.log('Error: ', err);
        }
        process.exit(1);
    });

const usersCache = [];
const chatHistory = [];
const chatServer = new wss({port: 8081});

function sendBroadcast(message) {
    const messageEncoded = JSON.stringify(message);
    chatServer.clients.forEach((client) => {
        client.send(messageEncoded);
    });
};

function sendMessage(ws, message) {
    const messageEncoded = JSON.stringify(message);
    ws.send(messageEncoded);
}

chatServer.on('connection', (ws) => {
    console.log('Client connection success');

    sendMessage(ws, {type: 'handshake', users: usersCache});

    ws.on('message', (msg) => {
        var message = JSON.parse(msg);

        switch (message.type) {
            case 'login':
                if (usersCache.indexOf(message.name) !== -1) {
                    sendMessage(ws, { type: 'conflict' });
                } else {
                    usersCache.push(message.name);
                    sendMessage(ws, {
                        type: 'connected',
                        name: message.name,
                        messages: chatHistory
                    });

                    const notify = {
                        type: 'system',
                        content: `Пользователь ${message.name} вошел в чат`,
                    };

                    chatHistory.push(notify);

                    notify.users = usersCache;

                    console.log(notify);
                    sendBroadcast(notify);

                    ws.userName = message.name;
                }
                break;

            case 'message':
                chatHistory.push(message);
                sendBroadcast(message);
                break;
        }
    });

    ws.on('close', () => {
        const notify = {
            type: 'system',
            content: `Пользователь ${ws.userName} вышел из чата`,
        };

        chatHistory.push(notify);

        usersCache.splice(usersCache.indexOf(ws.userName), 1)

        notify.users = usersCache;

        sendBroadcast(notify);
    });
});

//_.assign(app.locals, staticHelpers, { isDev: isDev });

//module.exports = app;
