from django import template
from spudderaccounts.utils import change_role_url
from spudderdomain.controllers import RoleController

register = template.Library()


@register.simple_tag(takes_context=True)
def link_to_change_role_and_return(context, role):
    return '%s?next=%s' % (change_role_url(role), context['request'].path)


@register.simple_tag
def link_to_role_management_page(role):
    return '/users/roles/manage/%s/%s' % (role.entity_type, role.entity.id)


@register.simple_tag(takes_context=True)
def link_to_delete_role_and_return(context, role):
    return '/users/roles/delete/%s/%s?next=%s' % (
        role.entity_type, role.entity.id, context['request'].path)


@register.filter(name='is_cern_student')
def is_cern_student(role):
    return role.entity_type == RoleController.ENTITY_STUDENT
