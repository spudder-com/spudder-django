from django import template
from spudderdomain.controllers import RoleController
from spudmart.CERN.utils import strip_invalid_chars
from spudmart.CERN.models import Student
register = template.Library()


@register.simple_tag
def strip_school_name(school):
    """
    Strips invalid characters from the school name for nicer URLs
    :param school: a School object whose name we want stripped
    :return: the name of the school without any invalid characters
    """
    return strip_invalid_chars(school.name)


@register.simple_tag(takes_context=True)
def my_school_link(context, user):
    """
    Gets the link for the school of the supplied student user
    :param user: a user who is also a student
    :return: the relative link to the page for the student's school
    """
    current_role = context['request'].current_role
    if current_role.entity_type == RoleController.ENTITY_STUDENT:
        sch = current_role.entity.school
        return '/cern/%s/%s/%s' % (sch.state, sch.id, strip_invalid_chars(sch.name))
    else:
        return ''