from django.conf.urls.defaults import *

urlpatterns = patterns(
    'spudderqa.views',

    url(r'signin$', 'signin'),
    url(r'ui_testing$', 'ui_testing'),
    url(r'send_error_email_to_admins', 'send_error_email_to_admins'),
    url(r'dashboard$', 'dashboard'),
)
