from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_page, name='main_page'),
    path('create_chat/', views.create_chat, name='create_chat'),
    path('<str:room_name>/', views.chat_page, name='chat_page')
]
