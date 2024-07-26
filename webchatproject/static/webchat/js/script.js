document.addEventListener('DOMContentLoaded', function() {
    const room_name_input = document.querySelector('#room-name-input');
    const room_name_submit = document.querySelector('#room-name-submit');
    const new_room_name_submit = document.querySelector('#new-room-name-submit');
    const errorElement = document.querySelector('#error-message');
    const leave_button = document.querySelector('#leave-button');
    const new_chat = false;
    if (room_name_input && room_name_submit ) {
        room_name_input.focus();
        room_name_input.onkeyup = function(e) {
            if (e.key === 'Enter') {  // enter, return
                room_name_submit.click();
            }
        };
        room_name_submit.onclick = function(e) {
            var roomName = room_name_input.value;
            if (!roomName.trim()) {
                errorElement.textContent = 'Room name cannot be empty.';
                errorElement.style.display = 'block';
                return;
            }

            const validNamePattern = /^[\w]+$/;
            if (!validNamePattern.test(roomName.trim())) {
                errorElement.textContent = 'Room name contains invalid characters. Only letters, numbers, and underscores are allowed.';
                errorElement.style.display = 'block';
                return;
            }
            window.location.pathname = '/' + roomName + '/';
        };
    }
//    это очень тупая чать кода
    if (room_name_input && new_room_name_submit) {
        room_name_input.focus();
        room_name_input.onkeyup = function(e) {
            if (e.key === 'Enter') {  // enter, return
                new_room_name_submit.click();
            }
        };
        new_room_name_submit.onclick = function(e) {
            var roomName = room_name_input.value;
            if (!roomName.trim()) {
                errorElement.textContent = 'Room name cannot be empty.';
                errorElement.style.display = 'block';
                return;
            }

            const validNamePattern = /^[\w]+$/;
            if (!validNamePattern.test(roomName.trim())) {
                errorElement.textContent = 'Room name contains invalid characters. Only letters, numbers, and underscores are allowed.';
                errorElement.style.display = 'block';
                return;
            }
            window.location.pathname = '/' + roomName + '/';
        };
    }

    chat_list = document.getElementById('chat-list');
    if (chat_list){
        chat_list.addEventListener('click', function(e) {
            if (e.target && e.target.matches('.chat-item')){
                var roomName = e.target.getAttribute('data-chat-name');
                window.location.pathname = '/' + roomName + '/';
            }
        });
    }

    if (leave_button) {
        leave_button.onclick = function(e) {
            window.location.pathname = '/';
        };
    }

    inputted_room_name = document.getElementById('room-name');
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

        chatSocket.onopen = function(e){
            chatSocket.send(JSON.stringify({
                'command':'fetch_messages',
                'new_chat':new_chat,
            }))
        };

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

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.key === 'Enter') {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            chatSocket.send(JSON.stringify({
                'message': message,
                'command': 'new_message',
            }));
            messageInputDom.value = '';
        };

        function createMessage(data) {
            var message = data['content'];
            var author = data['sender'];
            var sent_at = data['sent_at']
            var formattedMessage = `${author} - ${sent_at} - ${message}`;
            document.querySelector('#chat-log').value += (formattedMessage + '\n');
        };
    }
});