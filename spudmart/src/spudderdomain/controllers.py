from spudmart.CERN.models import Student


class RoleController(object):
    """
    The RoleController offers a unified internal api for managing user roles within Spudder
    """

    ENTITY_STUDENT = "student"

    def __init__(self, user):
        """
        Init a new role controller based on the provided User instance

        :param user: a django.contrib.auth.models.User instance
        :return: a RoleController instance based on the provided user
        """
        self.user = user

    def roles_by_entity(self, entity_key, entity_wrapper):
        roles = []
        if entity_key == self.ENTITY_STUDENT:
            roles = Student.objects.filter(user=self.user)
        roles = [entity_wrapper(r) for r in roles]
        return roles
