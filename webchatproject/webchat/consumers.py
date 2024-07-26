import datetime
import json
import re

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, Chat, ChatMember
from channels.generic.websocket import AsyncWebsocketConsumer

User = get_user_model()


def message_to_json(message):
    return {
        'sent_at': datetime.datetime.strftime(message.sent_at, '%Y-%m-%d %H:%M'),
        'sender': message.sender.username,
        'content': message.content
    }


class ChatConsumer(AsyncWebsocketConsumer):

    # Connecting to the certain chat
    # непонятно, надо ли прописывать проверку существования комнтаы в методе connect или далее
    async def connect(self):
        print("successfully connect")

        # grabbing the name of the room from scope
        self.room_name = self.get_room_name()

        # creating the new attribute (name of the "room")
        self.room_group_name = "chat_%s" % self.room_name

        # grabbing the name of the user
        self.user = self.scope["user"]
        print(f"[+] Connect user: {self.user}; {self.user.is_authenticated}")

        chat = await self.get_chat()

        await self.is_member(chat)

        # Connecting to the room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # Accepting connection by server
        await self.accept()

    # Exit from the room
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # This method should be called in case of entering the room
    # or receiving the message from other users
    async def receive(self, text_data):

        data = json.loads(text_data)
        # if (data['new_chat']):
        #     new_chat = await self.create_new_chat()
        # chat = await self.get_chat()
        #
        # await self.is_member(chat)


        print(f"Command is {data['command']}")
        # grabbing the name of the command from json file
        # and execute it's corresponding method
        await self.commands[data['command']](self, data)

    # Process last 20 messages from the db for certain chat to display them
    async def fetch_messages(self, data):
        print('inside fetch_messages')
        chat = await self.get_chat()
        messages = await self.last_20_messages(chat)

        messages_json = [await sync_to_async(message_to_json)(message) for message in messages]
        content = {
            'command': 'messages',
            'messages': messages_json
        }
        await self.display_messages(content)

    # Save new message from our user to the db
    async def new_message(self, data):
        print('trying to add new message')
        user_id = self.scope["user"].id
        chat = await self.get_chat()
        message = await self.save_message(user_id, data['message'], chat)
        content = {
            'command': 'message',
            'message': await sync_to_async(message_to_json)(message)
        }
        await self.send_chat_message(content)

    # List of actions that we get from the json and according
    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message
    }

    # Prepare content and send it to other users in this chat
    async def send_chat_message(self, message):

        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "display_message",
                "message": message
            }
        )

    # Sending the messages by the websocket to our user
    async def display_messages(self, messages):
        print(f'display {messages}')
        await self.send(text_data=json.dumps(messages))

    # Sending the new message by the websocket back to the user who sent it
    async def display_message(self, event):
        print(f'display {event}')
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    def get_room_name(self):
        return self.scope["url_route"]["kwargs"]["room_name"]

    @database_sync_to_async
    def create_new_chat(self):
        pass

    @database_sync_to_async
    def get_chat(self):
        chat, created = Chat.objects.get_or_create(name=self.get_room_name())
        return chat

    @database_sync_to_async
    def save_message(self, sender, content, chat):
        user = User.objects.get(pk=sender)
        return Message.objects.create(sender=user, chat=chat, content=content)

    @database_sync_to_async
    def last_20_messages(self, chat):
        return list(Message.objects.filter(chat=chat).order_by('-sent_at')[:20])

    @database_sync_to_async
    def is_member(self, chat):
        ChatMember.objects.get_or_create(chat=chat, user=self.user)

