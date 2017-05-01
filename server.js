const wss = require('ws').Server;
const uuid = require('uuid/v4');

class ChatServer {
    usersCache = [];
    chatHistory = [];
    sessions = {};
    chatServer = null;
    socket = null;

    constructor({ port = 8081 } = {}) {
        this.chatServer = new wss({ port });
        this.chatServer.on('connection', this.connectionHandler);
    }

    sendBroadcast(message) {
        const messageEncoded = JSON.stringify(message);
        this.chatServer.clients.forEach((client) => {
            client.send(messageEncoded);
        });
    }

    sendMessage(sessionId, message) {
        const messageEncoded = JSON.stringify(message);
        this.sessions[sessionId].socket.send(messageEncoded);
    }

    // create session on first request
    // send user id on connect
    connectionHandler = (socket) => {
        console.log('Client connection success');

        const sessionId = uuid();
        this.sessions[sessionId] = { socket };
        this.sendMessage(sessionId, { type: 'handshake', sessionId });

        this.chatServer.on('message', this.messageHandler);
        this.chatServer.on('close', this.closeHandler);
    };

    messageHandler = (msg) => {
        const message = JSON.parse(msg);

        switch (message.type) {
            case 'login':
                // TODO: Store users in hash
                if (this.usersCache.indexOf(message.name) !== -1) {
                    this.sendMessage(message.sessionId, { type: 'conflict' });
                } else {
                    this.usersCache.push(message.name);
                    this.sendMessage(message.sessionId, {
                        type: 'connected',
                        name: message.name,
                        messages: this.chatHistory
                    });

                    const notify = {
                        type: 'system',
                        content: `Пользователь ${message.name} вошел в чат`,
                    };
                    notify.users = this.usersCache;

                    this.chatHistory.push(notify);

                    console.log(notify);
                    this.sendBroadcast(notify);

                    this.socket.userName = message.name;
                }
                break;

            case 'message':
                this.chatHistory.push(message);
                this.sendBroadcast(message);
                break;
        }
    };

    closeHandler = (...args) => {
        console.log(...args);
        // const notify = {
        //     type: 'system',
        //     content: `Пользователь ${ws.userName} вышел из чата`,
        // };
        //
        // this.chatHistory.push(notify);
        //
        // this.usersCache.splice(this.usersCache.indexOf(ws.userName), 1);
        //
        // notify.users = this.usersCache;
        // this.sendBroadcast(notify);
    };
}

module.exports = ChatServer;
