from django.conf.urls.defaults import *


urlpatterns = patterns(
    'spudmart.challenges.views',

    (r'^$', 'get_challenges'),
    (r'^(?P<challenge_id>\d+)$', 'view_challenge'),
    (r'^(?P<challenge_id>\d+)/accept$', 'accept_challenge_wizard'),
    (r'^(?P<challenge_id>\d+)/donate$', 'donate_challenge'),
    (r'^(?P<challenge_id>\d+)/decline$', 'decline_challenge'),
    (r'^template/(?P<template_id>\d+)$', 'view_challenge_template'),
    (r'^template/(?P<template_id>\d+)/edit$', 'edit_challenge_template'),
    (r'^create$', 'new_challenge_wizard_view'),
    (r'^upload_video$', 'upload_video'),
    (r'^upload_video/(?P<video_id>\d+)', 'view_video'),
    (r'^upload_video/(?P<video_id>\d+)/post_to_youtube', 'upload_video_to_youtube'),
)
