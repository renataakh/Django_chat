from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import CreateView

from users.forms import RegistrationForm


# Create your views here.


class Login(LoginView):
    form_class = AuthenticationForm
    template_name = 'login.html'
    extra_context = {'title': 'Login'}


class Registration(CreateView):
    form_class = RegistrationForm
    template_name = 'registration.html'
    extra_context = {'title': 'Sign-in'}
    success_url = reverse_lazy('login')


