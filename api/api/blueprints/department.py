from flask import Blueprint, request, jsonify
from api.db.models.teacher import TeacherRole, Teacher

from api.middleware.validate import validate
from api.middleware.authenticate import authenticate
import api.middleware.authorize as authorize

from api.db.models.department import Department
from api.db.id import generate_id, IdPrefix
from api.db import Session

import api.lib.validate as rules
from api.lib.error.local import LocalError, LocalErrorCode

blueprint = Blueprint("department", __name__)

@blueprint.post("/departments")
@authenticate()
@authorize.has_role(TeacherRole.ADMIN)
@validate(
    json=rules.object({
        "name": rules.string().min_len(1).max_len(64),
        "lead_id": rules.exists(Teacher)
    })
)
@authenticate()
def create_grading_system():
    dep = Department(
        id=generate_id(IdPrefix.Department), 
        **request.get_json()
    )

    Session.add(dep)
    Session.commit()

    return dep.to_dict(['id', 'name'])


@blueprint.get("/departments")
@authenticate()
def get_grading_system():
    deps = Session.query(Department)

    return jsonify([dep.to_dict([
        'id',
        'name'
    ]) for dep in deps])

@blueprint.delete("/departments/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Department)
    })
)
@authorize.has_role(TeacherRole.ADMIN)
def delete_grading_system(id):
    dep = Session.get(Department, id)

    if not dep:
        raise LocalError(LocalErrorCode.UNKNOWN_DEPARTMENT)


    Session.delete(dep)
    Session.commit()

    return "", 204