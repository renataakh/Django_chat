from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

User = get_user_model()


class Chat(models.Model):
    name = models.CharField(max_length=20, unique=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ChatMember(models.Model):
    user = models.ForeignKey(User, related_name='chat_members', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, related_name='chat_members', on_delete=models.CASCADE)
    admin_status = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
    sender = models.ForeignKey(User, related_name='messages', null=True, on_delete=models.SET_NULL)
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    has_file = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return self.content




class File(models.Model):
    message = models.ForeignKey(Message, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name
