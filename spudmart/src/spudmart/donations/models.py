from django.contrib.auth.models import User
from django.db import models
from spudmart.spudder.models import TeamOffer


class DonationState():
    def __init__(self):
        pass

    NOT_STARTED = 1
    PENDING = 2
    FINISHED = 3
    TERMINATED = 4


class Donation(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    offer = models.ForeignKey(TeamOffer)
    donor = models.ForeignKey(User)
    donation = models.FloatField(default=0)
    state = models.IntegerField(default=DonationState.NOT_STARTED)
    sender_token_id = models.CharField()