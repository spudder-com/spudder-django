import re
from django.shortcuts import redirect
from spudderaccounts.utils import select_user_role_if_only_one_role_exists, select_all_user_roles, change_current_role
from spudderaccounts.wrappers import RoleBase
from spudderdomain.controllers import RoleController
from spudderkrowdio.models import KrowdIOStorage
from spudderkrowdio.utils import get_following
from spudmart.CERN.models import School
from spudmart.venues.models import Venue


class RolesMiddleware:
    def _add_current_role(self, request):
        current_role = None
        if request.user and request.user.is_authenticated():
            role_controller = RoleController(request.user)
            current_role = request.session.get('current_role', None)
            if not current_role:
                one_ane_only_role = select_user_role_if_only_one_role_exists(role_controller)
                if one_ane_only_role:
                    current_role = {
                        'entity_type': one_ane_only_role.entity_type,
                        'entity_id': one_ane_only_role.entity.id}
            if current_role:
                change_current_role(request, current_role['entity_type'], current_role['entity_id'])
                current_role = role_controller.role_by_entity_type_and_entity_id(
                    current_role['entity_type'],
                    current_role['entity_id'],
                    RoleBase.RoleWrapperByEntityType(current_role['entity_type']))
        request.current_role = current_role

    def _add_all_roles(self, request):
        all_roles = []
        if request.user and request.user.is_authenticated():
            role_controller = RoleController(request.user)
            all_roles = select_all_user_roles(role_controller)
        request.all_roles = all_roles

    def process_request(self, request):
        self._add_current_role(request)
        self._add_all_roles(request)
        if request.all_roles and len(request.all_roles) > 1:
            if not request.user.spudder_user.has_set_password:
                request.user.spudder_user.mark_as_password_required()


class AccountPasswordMiddleware:
    def process_request(self, request):
        path = '/users/account/create_password'
        if request.path != path and request.user and request.user.is_authenticated():
            spudder_user = request.user.spudder_user
            if spudder_user.needs_to_set_password and not spudder_user.has_set_password:
                return redirect("%s?next=%s" % (path, request.get_full_path()))


class EditPageMiddleware:
    def process_request(self, request):
        path = str(request.path)
        can_edit = False
        if re.match(r'/cern/student/\d+', path):
            if request.current_role.entity_type == RoleController.ENTITY_STUDENT:
                if str(request.current_role.entity.id) == str.split(path, '/')[-1]:
                    can_edit = True
        elif re.match(r'/cern/\w{2}/\d+/\w+', path):
            if request.current_role.entity_type == RoleController.ENTITY_STUDENT:
                sch = School.objects.get(id=str.split(path, '/')[-3])
                if request.current_role.entity == sch.get_head_student():
                    can_edit = True
        elif re.match(r'/venues/view/\d+', path):
            if request.current_role.entity_type == RoleController.ENTITY_STUDENT:
                ven = Venue.objects.get(id=str.split(path, '/')[-1])
                if request.current_role.entity == ven.student:
                    can_edit = True

        request.can_edit = can_edit


class KrowdIO(object):
    pass


class FollowMiddleware:
    def check_can_follow(self, request):
        path = str(request.path)
        can_follow = False
        if request.user.is_authenticated and request.current_role:
            if request.current_role.entity_type == RoleController.ENTITY_FAN:
                if re.match(r'/fan/\d+', path) or \
                        re.match(r'/venues/view/\d+', path) or \
                        re.match(r'/team/page/\d+', path):
                    can_follow = True

        request.can_follow = can_follow

    def check_following_page(self, request):
        followers = get_following(request.current_role)
        following = False
        if followers['totalItems'] > 0:
            for user in followers['data']:
                item = KrowdIOStorage.objects.get(krowdio_user_id=user['_id'])
                path = str(request.path)
                if re.match('/venues/view/\d+', path):
                    if str(item.venue.id) == str.split(path, '/')[-1]:
                        following = True
                elif re.match('/fan/\d+', path):
                    if str(item.role_id) == str.split(path, '/')[-1]:
                        following = True
                elif re.match('/team/page/\d+', path):
                    if str(item.team.id) == str.split(path, '/')[-1]:
                        following = True
        request.following = following

    def process_request(self, request):
        self.check_can_follow(request)
        if request.can_follow:
            self.check_following_page(request)
        else:
            request.following = False
