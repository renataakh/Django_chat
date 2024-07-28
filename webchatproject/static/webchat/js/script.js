document.addEventListener('DOMContentLoaded', function() {
    const room_name_input = document.querySelector('#room-name-input');
    const room_name_submit = document.querySelector('#room-name-submit');
    const new_room_name_submit = document.querySelector('#new-room-name-submit');
    const errorElement = document.querySelector('#error-message');
    const leave_button = document.querySelector('#leave-button');
    var new_chat = false;
    const chat_list = document.getElementById('chat-list');
    const inputted_room_name = document.getElementById('room-name');


//    create_page
    room_submit(room_name_input, new_room_name_submit);

//    main_page
    room_submit(room_name_input, room_name_submit);

//    main_page chat history
    if (chat_list){
        chat_list.addEventListener('click', function(e) {
            if (e.target && e.target.matches('.chat-item')){
                var roomName = e.target.getAttribute('data-chat-name');
                window.location.pathname = '/' + roomName + '/';
            }
        });
    }

//    cancel or leave chat button create_page or chat
    if (leave_button) {
        leave_button.onclick = function(e) {
            window.location.pathname = '/';
        };
    }

//    chat websocket connection and events handling
    if (inputted_room_name){
        roomName = JSON.parse(inputted_room_name.textContent)
        console.log(roomName)
        const chatSocket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/chat/'
            + roomName
            + '/'
        );

//        asking to receive previous messages of the chat when we open the chat_page
        chatSocket.onopen = function(e){
            chatSocket.send(JSON.stringify({
                'command':'fetch_messages',
                'new_chat':new_chat,
            }))
        };

//        receiving message from the server and handling it
        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);

            if (data['command'] === 'messages') {
                for (let i=0; i<data['messages'].length; i++) {
                    createMessage(data['messages'][i]);
                }
            } else if (data['command'] === 'message') {
                createMessage(data['message'])
            }
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };

//        handling message input
        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.key === 'Enter') {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

//        сюда можно будет доавить проверку на то, что сообщение не пустое при отправке фалов
        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            if (message) {
                chatSocket.send(JSON.stringify({
                    'message': message,
                    'command': 'new_message',
                }));
            }
            messageInputDom.value = '';
        };


    }

    function createMessage(data) {
            var message = data['content'];
            var author = data['sender'];
            var sent_at = data['sent_at']
            var formattedMessage = `${author} - ${sent_at} - ${message}`;
            document.querySelector('#chat-log').value += (formattedMessage + '\n');
        };

//    this function checks if the name matches the valid name pattern and is not empty
    function check_valid_name(name, NamePattern) {

        if (!name.trim()) {
            errorElement.textContent = 'Room name cannot be empty.';
            errorElement.style.display = 'block';
            return false;
        }
        if (!NamePattern.test(name.trim())) {
            errorElement.textContent = 'Room name contains invalid characters. Only letters, numbers, and underscores are allowed.';
            errorElement.style.display = 'block';
            return false;
        }
        return true;
    }

//    this function handles user's input and
//    submits joining to the existing room or creating the new one
    function room_submit(input, submit) {
        if (input && submit ) {
            input.focus();
            input.onkeyup = function(e) {
                if (e.key === 'Enter') {  // enter, return
                    submit.click();
                }
            };
            submit.onclick = function(e) {
                var roomName = input.value;
                var validNamePattern = /^[\w]+$/;
                if (!check_valid_name(roomName, validNamePattern)) {
                    return
                }
                window.location.pathname = '/' + roomName + '/';
            };
        }
    };
});