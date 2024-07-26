from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


# Create your views here.
@login_required
def main_page(request):
    user = get_user_model()
    d = {
        'title': f'welcome {user.username}'
    }
    return render(request, 'main_page.html', d)


@login_required
def chat_page(request, room_name):

    print(room_name)
    d = {
        'title': room_name,
        'room_name': room_name,
    }
    return render(request, 'chat.html', d)


@login_required
def create_chat(request):
    d = {
        'title': create_chat,
    }
    return render(request, 'create_chat.html', d)



