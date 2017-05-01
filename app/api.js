const _events = Symbol('events');
const _socket = Symbol('socket');

class ApiClient {
    constructor(endpoint) {
        this[_events] = {};
        this[_socket] = new WebSocket(endpoint);

        this[_socket].addEventListener('message', this.handleMessage);
        this[_socket].addEventListener('error', this.handleError);
        this[_socket].addEventListener('close', this.handleClose);
    }

    handleMessage = (event) => {
        const message = JSON.parse(event.data);

        switch(message.type) {
            case 'handshake':
                this.sessionId = message.sessionId;
                break;

            case 'connected':
                this.emit('connected', { name: message.name, history: message.messages });
                break;

            case 'system':
                this.emit('system', { users: message.users });
                break;

            case 'message':
                this.emit('message', { ...message });
                break;
        }

    };

    handleError = (error) => {
        console.log(error);
    };

    handleClose = () => {
        this.emit('close', {type: 'system', content: 'Connection has been closed'});
    };

    emit(event, data) {
        const handlers = this[_events][event];

        if (!handlers) {
            return;
        }

        if (typeof handlers === 'function') {
            handlers(data);
        } else {
            handlers.forEach(listener => listener(data));
        }
    }

    send({ type, name, content }) {
        this[_socket].send(JSON.stringify({ type, name, content }));
    }

    on(type, handler) {
        const handlers = this[_events][type];

        if (!handlers) {
            this[_events][type] = handler;
        } else if (Array.isArray(handlers)) {
            handlers.push(fn);
        } else {
            this[_events][type] = [this[_events][type], handler];
        }
    }

    off(type, handler) {
        const handlers = this[_events][type];

        if (!handlers) {
            return;
        }

        if (typeof handlers === 'function' && handlers === handler) {
            this[_events][type] = null;
        } else if (Array.isArray(handlers)) {
            const filteredHandlers = handlers.filter(fn => fn !== handler);
            this[_events][type] = filteredHandlers.length ? filteredHandlers : null;
        }

    }

    flush() {
        this[_events] = {};
    }

    login(name) {
        this.send({ type: 'login', name });
    }

    message(name, message) {
        const sanitizedMessage = message
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br />');

        this.send({ type: 'message', content: sanitizedMessage, name });
    }
}

export default ApiClient;
