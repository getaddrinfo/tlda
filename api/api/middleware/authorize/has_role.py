from functools import wraps

from api.db.models.teacher import TeacherRole
from api.lib.error.local import LocalError, LocalErrorCode
from api.middleware.authenticate import get_user

def has_role(role: TeacherRole):
    def has_role_impl(f):
        @wraps(f)
        def wrapper(*args, **kwargs):   
            if not can_continue(get_user().role, role):
                raise LocalError(LocalErrorCode.MISSING_ACCESS)
            
            return f(*args, **kwargs)

        return wrapper

    return has_role_impl


# permissions:
# admin: all (ADMIN, SLT, TEACHER)
# slt: (SLT, TEACHER)
# teacher: (TEACHER)
#
# a set is quick to lookup
# in other languages, it is often treated
# as a hashmap:
#
# type Set<T> = HashMap<T, ()> (where () is the Unit type 
# or similar in the language)
#
# PERMITTED_ROLES is of type 
# dict<TeacherRole, dict<TeacherRole, ()>>
PERMITTED_ROLES = {
    TeacherRole.ADMIN: set([TeacherRole.ADMIN, TeacherRole.SLT, TeacherRole.TEACHER]),
    TeacherRole.SLT: set([TeacherRole.SLT, TeacherRole.TEACHER]),
    TeacherRole.TEACHER: set([TeacherRole.TEACHER])
}

# given = the role teacher has
# minimum = the necessary minimum role required
def can_continue(given: TeacherRole, minimum: TeacherRole) -> bool:
    # Returns true if the teacher has the minimum permission required
    # or false if they do not
    return minimum in PERMITTED_ROLES[given]
