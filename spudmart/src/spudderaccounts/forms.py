from django import forms
from django.contrib.auth.models import User
from django.forms import HiddenInput, PasswordInput


class ProfileDetailsForm(forms.Form):
    first_name = forms.CharField(max_length=256, required=False)
    last_name = forms.CharField(max_length=256, required=False)


class CreatePasswordForm(forms.Form):
    next_url = forms.CharField(max_length=256, required=False, widget=HiddenInput)
    password_1 = forms.CharField(max_length=256, min_length=6, widget=PasswordInput)
    password_2 = forms.CharField(max_length=256, min_length=6, widget=PasswordInput)

    def clean(self):
        cleaned_data = super(CreatePasswordForm, self).clean()
        password_1 = cleaned_data.get('password_1').strip()
        password_2 = cleaned_data.get('password_2').strip()
        if len(password_1) < 6:
            raise forms.ValidationError("Passwords must be at least 6 characters long.")
        if password_1 != password_2:
            raise forms.ValidationError("Passwords must match.")
        return cleaned_data


class SigninForm(forms.Form):
    next_url = forms.CharField(max_length=256, required=False, widget=HiddenInput)
    user_id = forms.CharField(max_length=256, widget=HiddenInput)
    password = forms.CharField(max_length=256, min_length=6, widget=HiddenInput)

    def clean(self):
        data = super(SigninForm, self).clean()
        user_id = data.get('user_id')
        password = data.get('password').strip()
        user = User.objects.get(id=user_id)
        if not user.check_password(password):
            raise forms.ValidationError('The password you entered is incorrect.')
        return data
