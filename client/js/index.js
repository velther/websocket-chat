(function () {
    'use strict';
    const chatSocket = new WebSocket('ws://localhost:8081');

    const appState = {
        view: 'login'
    };

    let usersCache;

    const templates = {
        system: '<div class="chat-message chat-message-system">' +
            '<div class="chat-message-text">##MSG##</div>' +
            '</div>',
        message: '<div class="chat-message##ADD_CLASS##">' +
            '<div class="chat-message-name">##USER_NAME##</div>' +
            '<div class="chat-message-text">##MSG##</div>' +
            '</div>'
    };

    function renderMessage(message) {
        const subs = {
            '##ADD_CLASS##': message.name === appState.userName ? ' chat-message-my' : '',
            '##USER_NAME##': message.name === appState.userName ? 'Вы' : message.name,
            '##MSG##': message.content
        };

        function render(pattern) {
            return subs[pattern];
        };

        return templates[message.type].replace(/##\w+?##/g, render);
    };

    function renderHistory(chatHistory) {
        const messagesHTML = chatHistory.map((message) => renderMessage(message));
        return messagesHTML.join('');
    };

    function renderContacts(contacts) {
        return contacts.map((user) => `<div class="chat-contact ${user === appState.userName ? 'chat-contact-current' : ''}">${user}</div>`).join('');
    };

    chatSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch(message.type) {
            case 'handshake':
                usersCache = message.users;
                break;

            case 'connected':
                appState.view = 'chat';
                appState.userName = message.name;
                insertMessages(renderHistory(message.messages));
                break;

            case 'system':
                usersCache = message.users;
                insertContacts(renderContacts(usersCache));
            case 'message':
                insertMessage(renderMessage(message));
                break;
        }
    };

    chatSocket.onerror = (error) => {
        console.log(error);
    };

    chatSocket.onclose = () => {
        insertMessage(renderMessage({type: 'system', content: 'Соединение с сервером закрыто'}));
    };

    const loginForm = document.querySelector('.js-login-form');
    const chatView = document.querySelector('.js-chat-view');
    const messagesView = chatView.querySelector('.js-messages');
    const messagesContainer = chatView.querySelector('.js-messages-container');
    const contactsContainer = chatView.querySelector('.js-contacts');

    function setScrollPos() {
        messagesContainer.scrollTop = messagesView.clientHeight;
    };

    function insertMessage(message) {
        const tmpNode = document.createElement('div');
        tmpNode.innerHTML = message;
        messagesView.appendChild(tmpNode.firstChild);
        setScrollPos();
    }

    function insertMessages(messages) {
        messagesView.innerHTML += messages;
        setScrollPos();
    }

    function insertContacts(contacts) {
        contactsContainer.innerHTML = contacts;
    }

    // Пока-пока Object.observe :'( https://esdiscuss.org/topic/an-update-on-object-observe
    Object.observe(appState, function (changes) {
        const fields = Array.from(changes, (change) => change.name);

        if (fields.indexOf('view') !== -1) {
            switch (appState.view) {
                case 'login':
                    loginForm.classList.remove('g-hidden');
                    chatView.classList.add('g-hidden');
                    break;
                case 'chat':
                    loginForm.classList.add('g-hidden');
                    chatView.classList.remove('g-hidden');
                    break;
            }
        }
    });


    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = loginForm.querySelector('.js-username').value;
        if (userName && usersCache.indexOf(userName) === -1) {
            chatSocket.send(JSON.stringify({type: 'login', name: userName}));
        } else {
            loginForm.classList.add('login-error');
        }
    });

    const composeForm = chatView.querySelector('.js-compose-form');
    const composeInput = composeForm.querySelector('.js-compose');

    function messageSender() {
        const message = composeInput.value;
        if (message) {
            const sanitizedMessage = message
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br />');

            chatSocket.send(JSON.stringify({
                type: 'message',
                name: appState.userName,
                content: sanitizedMessage
            }));

            composeInput.value = '';
        }
    };

    composeInput.addEventListener('keydown', (e) => {
        if (e.keyIdentifier === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            messageSender();
        }
    });

    composeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        messageSender();
    });
})();
