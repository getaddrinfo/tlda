from enum import IntEnum
from typing import List
from flask import Blueprint, request, abort, jsonify
from api.db.dict import Encode, Iterate, Map, Place

from api.db.id import IdPrefix, generate_id
from api.db.models.event import EventType
from api.db.models.scheduled_review import ReviewType, ScheduledReview
from api.db.models.watch_request import WatchRequestReasonType
from api.db.models._class import Class

from api.db.resolve import create_ref_from_id
from api.lib.resolved import Resolved
from api.db.paginate import paginate, PaginationArguments
from api.lib.parse import parse_date
import api.middleware.authorize as authorize
from api.blueprints.auth import EMAIL_REGEX, clear_sessions
from api.db import Session
from api.db.models import Department, Teacher, TeacherRole, Event, WatchRequest
from api.db.models.ref.teacher_to_department import ref

import bcrypt
from .auth import PASSWORD_RULE

from api.lib.error.local import LocalError, LocalErrorCode
from api.middleware.authenticate import authenticate, get_user
from api.middleware.validate import validate
import api.lib.validate as rules

from sqlalchemy import func, insert, or_
from sqlalchemy.exc import IntegrityError

blueprint = Blueprint("user", __name__)

def teacher_serialize(teacher: Teacher):
    return teacher.to_dict([
        'id',
        'email',
        'name',
        'preferred_name',
        'role',
        Place({
            'departments': [
                {
                    'id': department.id,
                    'name': department.name,
                    'lead': department.lead_id == teacher.id
                } for department in teacher.departments
            ]
        })
    ])

@blueprint.get("/users/@me")
@authenticate()
def get_self():
    teacher = get_user()
    return teacher_serialize(teacher)

@blueprint.get("/users/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Teacher)
    })
)
def get_teacher(id):
    teacher = Resolved.get(id)
    return teacher_serialize(teacher)

@blueprint.patch("/users/<id>")
@validate(
    json=rules.object({
        'role': rules.enum(TeacherRole).optional()
    })
)
@authenticate()
@authorize.has_role(TeacherRole.ADMIN)
def patch_teacher(id):
    data = request.get_json()

    # if there are no values to change
    # then their request is bad. At least
    # one value must be specified to change.
    if len(data.keys()) == 0:
        abort(400)

    teacher = Session.get(Teacher, id)
    if not teacher:
        raise LocalError(LocalErrorCode.UNKNOWN_TEACHER)

    if (role := data.get("role")) is not None:
        teacher.role = TeacherRole(role)

    Session.commit()

    return "", 204

@blueprint.delete("/users/@me/sessions")
@authenticate()
def delete_all_sessions():
    # blueprints/auth.py
    # done for api clarity
    clear_sessions()

@blueprint.delete("/users/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Teacher)
    })
)
@authorize.has_role(TeacherRole.ADMIN)
def delete_user(id):
    teacher = Resolved.get(id)
    
    try:
        Session.delete(teacher)
        Session.commit()
    except IntegrityError:
        abort(409)

    return "", 204

@blueprint.get("/users/@me/departments")
@authenticate()
def get_self_departments():
    return build_departments_response(
        get_user().departments
    )

@blueprint.get("/users/<id>/departments")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Teacher)
    })
)
def get_user_departments(id):
    return build_departments_response(
        Resolved.get(id).departments
    )


def build_departments_response(departments):    
    data = []
    department_ids = tuple([d.id for d in departments])

    # id -> count
    count_teachers = {
        dep_id: count for (dep_id, count) in Session.execute(
"""
SELECT department_id, COUNT(*) FROM ref_teacher_to_department
WHERE department_id IN :departments
GROUP BY department_id
""",
            { 
                'departments': department_ids
            }
        ).all()
    }

    count_students = {
        dep_id: count for (count, dep_id) in Session.execute(

# TODO(7): make bad query lol
"""
SELECT COUNT(DISTINCT(assoc_class_to_student.student_id)), department.id as department_id FROM assoc_class_to_student
INNER JOIN class ON assoc_class_to_student.class_id = class.id
INNER JOIN department ON class.department_id = department.id
WHERE department.id in :departments
GROUP BY department.id
""",
            {
                'departments': department_ids
            }
        ).all()
    }

    for department in departments:       
        data.append(department.to_dict([
            'id',
            'name',
            Place({
                'students': count_students.get(department.id, 0),
                'teachers': count_teachers.get(department.id, 0)
            }),
            Encode('lead', [
                'id',
                'name',
                'email'
            ])
        ]))

    return jsonify(data)

@blueprint.put("/users/<user_id>/departments/<department_id>")
@validate(
    path=rules.object({
        'user_id': rules.exists(Teacher),
        'department_id': rules.exists(Department)
    })
)
def add_department(user_id, department_id):
    Session.execute("INSERT INTO ref_teacher_to_department (teacher_id, department_id) VALUES (:user_id, :department_id)", {
        "user_id": user_id,
        "department_id": department_id
    })

    Session.commit()

    return "", 204

@blueprint.delete("/users/<user_id>/departments/<department_id>")
@validate(
    path=rules.object({
        'user_id': rules.exists(Teacher),
        'department_id': rules.exists(Department)
    })
)
def remove_department(user_id, department_id):
    Session.execute("DELETE FROM ref_teacher_to_department WHERE teacher_id = :user_id AND department_id = :department_id", {
        "user_id": user_id,
        "department_id": department_id
    })

    Session.commit()

    return "", 204

@blueprint.get("/users/@me/profile")
@authenticate()
def get_self_profile():
    return build_profile_response(get_user(), is_self=True)

@blueprint.get("/users/<id>/profile")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Teacher),
    })
)
def get_user_profile(id):
    teacher = Resolved.get(id)
    return build_profile_response(teacher)

def build_profile_response(teacher, is_self=False):
    num_classes = Session.execute("SELECT COUNT(*) FROM ref_class_to_teacher WHERE teacher_id = :teacher_id", { "teacher_id": teacher.id }).scalar()

    num_students = Session.execute(
"""
SELECT COUNT(DISTINCT(assoc_class_to_student.student_id)) FROM assoc_class_to_student
INNER JOIN class ON assoc_class_to_student.class_id = class.id
INNER JOIN ref_class_to_teacher ON ref_class_to_teacher.class_id = class.id
WHERE ref_class_to_teacher.teacher_id = :teacher_id
""",
        { "teacher_id": teacher.id }
    ).scalar()

    encoded = teacher_serialize(teacher)
    encoded['stats'] = {
        'students': num_students,
        'classes': num_classes,
    }

    if is_self:
        encoded['stats']['upcoming_events'] = Session.query(Event).filter(Event.teacher_id == teacher.id).count()

    return jsonify(encoded)


@blueprint.post("/users")
@authenticate()
@authorize.has_role(TeacherRole.ADMIN)
@validate(
    json=rules.object({
        "name": rules.string().required(),
        "email": rules.string()
            .matches(EMAIL_REGEX),
        "role": rules.enum(TeacherRole),
        "password": PASSWORD_RULE,
        "departments": rules.array(rules.string()),
    })
)
def create_user():
    data = request.get_json()

    if len(data['departments']) != 0:
        # count departments that are valid
        # if len(valid) == len(data.departments) then valid else invalid end
        
        valid = Session.query(func.count(Department.id)).filter(Department.id.in_(data['departments'])).scalar()
        if valid != len(data['departments']):
            raise LocalError(LocalErrorCode.UNKNOWN_DEPARTMENT)


    # create user
    user = Teacher(
        id=generate_id(IdPrefix.Teacher),
        email=data['email'],
        name=data['name'],
        role=TeacherRole[data['role']],
        password=bcrypt.hashpw(
            bytes(data.get("password"), "utf-8"),
            bcrypt.gensalt()
        )
    )

    Session.add(user)
    
    try:
        Session.commit()

    # if the user already exists
    # or we violate some form of constraint
    # when inserting data
    #
    # http 409 = conflict
    except IntegrityError as _:
        abort(409)

    # create link between user and departments

    if len(data['departments']) != 0:
        add_to_departments_stmt = (
            insert(ref).
            values([{
                "teacher_id": user.id,
                "department_id": department
            } for department in data['departments']])
        )

        Session.execute(add_to_departments_stmt)
        Session.commit()


    return teacher_serialize(user), 201

@blueprint.get("/users")
# @authenticate()
@validate(
    query=rules.object({
        "page": rules.integer().optional(),
        "per_page": rules.integer().optional().min(1).max(100) # min per page = 1, max per page = 100
    })
)
def get_many_users():
    page = int(request.args.get("page", 0))
    per_page = int(request.args.get("per_page", 25))

    # base query
    query = Session.query(Teacher) \
        .filter(Teacher.role != TeacherRole.ADMIN)

    def mapper(teacher, _):
        def map(x):
            return [o['name'] for o in x.get("departments")]

        return teacher.to_dict([
            'id', 
            'email', 
            'name', 
            'preferred_name', 
            'role',
            Map(Iterate('departments', ['name']), map)
        ])

    return paginate(
        query=query,
        args=PaginationArguments(
            page=page,
            per_page=per_page,
            mapper=mapper
        )
    )

class TypeEnum(IntEnum):
    TeachingMethods = 0
    BehaviouralControl = 1
    Other = 2

@blueprint.post("/users/<id>/watch")
@authenticate()
@validate(json=rules.variant("type", {
    "watch": rules.object({
        "date": rules.date(),
        "meta": rules.string().optional(),
        "type": rules.any(),
        "length": rules.integer().min(60).max(3600),
        "reason": rules.object({
            "type": rules.enum(TypeEnum),
            "data": rules.string().optional()
        })
    }),
    "progress": rules.object({
        "date": rules.date(),
        "type": rules.any(),
        "class_id": rules.string(),
        "meta": rules.string().optional()
    }),
    "performance": rules.object({
        "date": rules.date(),
        "type": rules.any(),
        "class_id": rules.string(),
        "meta": rules.string().optional()
    })
}), path=rules.object({ 'id': rules.exists(Teacher) }))
def inbound_handle_watch_request(id):
    data = request.get_json()

    if data['type'] == "watch":
        return watch_request(data, id)

    elif data['type'] == "progress":
        return progress_request(data, id)

    elif data['type'] == "performance":
        return performance_request(data, id)

    # if the request does not match
    # any of these, then 500 internal server
    # error it.

    # this case should never be reached, since
    # we are validating against a fixed set of types,
    # but just in case
    else:
        abort(500)


def watch_request(data, target_id):
    user = get_user()

    date = parse_date(data['date'])

    req = WatchRequest(
        id=generate_id(IdPrefix.WatchRequest),
        time=date,
        length=data['length'],
        accepted=False,
        meta=data.get("meta", None),
        reason_type=WatchRequestReasonType(data['reason'].get("type", 0)),
        reason_text=data['reason'].get("data", None),
        target_id=target_id,
        requester_id=user.id
    )

    Session.add(req)
    Session.commit()

    return {
        'id': req.id,
        'accepted': req.accepted,
        'target_id': req.target_id,
    }, 201

def progress_request(data, target_id):
    user = get_user()
    date = parse_date(data['date'])    

    watched = Event(
        id=generate_id(IdPrefix.Event),
        type=EventType.PROGRESS_REVIEW,
        scheduled_at=date,
        data={
            "time_taken": 5 * 60,
            "teacher": create_ref_from_id(user.id),
            "viewable_after": 15 * 60,
            "being_watched": True
        },
        teacher_id=target_id
    )
    watching = Event(
        id=generate_id(IdPrefix.Event),
        type=EventType.PROGRESS_REVIEW,
        scheduled_at=date,
        data={
            "time_taken": 5 * 60,
            "teacher": create_ref_from_id(target_id),
            "should_take_to_complete": 15 * 60,
            "being_watched": False
        },
        teacher_id=user.id
    )

    evts = [watched, watching]

    for evt in evts:
        Session.add(evt)

    Session.commit()

    reqs = ScheduledReview(
        id=generate_id(IdPrefix.ScheduledReview),
        type=ReviewType.Progress,
        
        reviewer_id=user.id,
        reviewing_id=target_id,

        reviewer_event_id=watching.id,
        reviewing_event_id=watched.id,

        class_id=data['class_id'],
        scheduled_at=date
    )

    Session.add(reqs)
    Session.commit()

    return "", 204

def performance_request(data, target_id):
    user = get_user()
    date = parse_date(data['date'])
    
    watching = Event(
        id=generate_id(IdPrefix.Event),
        type=EventType.PERFORMANCE_REVIEW,
        scheduled_at=date,
        data={
            "time_taken": 30 * 60,
            "teacher": create_ref_from_id(user.id),
            "being_watched": True,
            "viewable_after": 604800
        },
        teacher_id=target_id
    )
        
    watched = Event(
        id=generate_id(IdPrefix.Event),
        type=EventType.PERFORMANCE_REVIEW,
        scheduled_at=date,
        data={
            "time_taken": 30 * 60,
            "teacher": create_ref_from_id(target_id),
            "being_watched": False,
        },
        teacher_id=user.id
    )

    evts = [watching, watched]

    for evt in evts:
        Session.add(evt)

    Session.commit()

    reqs = ScheduledReview(
        id=generate_id(IdPrefix.ScheduledReview),
        type=ReviewType.Progress,
        
        reviewer_id=user.id,
        reviewing_id=target_id,

        reviewer_event_id=watching.id,
        reviewing_event_id=watched.id,

        class_id=data['class_id'],
        scheduled_at=date
    )

    Session.add(reqs)
    Session.commit()

    return "", 204

@blueprint.get("/users/@me/requests")
@validate(
    query=rules.object({
        "page": rules.integer().optional(),
        "per_page": rules.integer().optional().min(1).max(100) # min per page = 1, max per page = 100
    })
)
@authenticate()
def get_requests():
    user = get_user()
    page = int(request.args.get("page", 0))
    per_page = int(request.args.get("per_page", 25))

    requests: List[WatchRequest] = Session.query(WatchRequest) \
        .filter(WatchRequest.target_id == user.id) \
        .filter(WatchRequest.accepted == False) \

    res = []

    count = requests.count()

    # the subset of users for this page
    # based on the page and per_page value
    requests = requests \
        .limit(per_page) \
        .offset(page * per_page) \
        .all()

    for req in requests:
        requester: Teacher = req.requester

        res.append({
            'id': req.id,
            'length': req.length,
            'meta': None if req.meta == '' else req.meta,
            'requester': requester.to_dict(['id', 'name', 'email'])
        })

    next_page_index = (page + 1) if (count // per_page) != page else None

    return jsonify({
        'data': res,
        'paginatåion': {
            'count': count,
            'pages': {
                'next': next_page_index,
                'total': (count // per_page) + 1
            }
        }
    })


@blueprint.post("/users/@me/requests/<id>")
@authenticate()
@validate(json=rules.object({
    "location": rules.string()
}), path=rules.object({ 'id': rules.exists(WatchRequest) }))
def accept_watch_request(id):
    req = Resolved.get(id)
    data = request.get_json()

    req.accepted = True

    evts = [
        Event(
            id=generate_id(IdPrefix.Event),
            type=EventType.WATCH,
            scheduled_at=req.time,
            data={
                "with": create_ref_from_id(req.requester_id),
                "location": data.get("location")
            },
            teacher_id=req.target_id
        ),
        Event(
            id=generate_id(IdPrefix.Event),
            type=EventType.WATCH,
            scheduled_at=req.time,
            data={
                "with": create_ref_from_id(req.target_id),
                "location": data.get("location")
            },
            teacher_id=req.requester_id
        )
    ]

    for evt in evts:
        Session.add(evt)

    Session.commit()

    return "", 204

@blueprint.delete("/users/@me/requests/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(WatchRequest),
    })
)
def deny_watch_request(id):
    req = Resolved.get(id)
    
    Session.delete(req)
    Session.commit()

    return "", 204

@blueprint.get("/users/search")
@validate(
    query=rules.object({
        "q": rules.string().required(),
        "limit": rules.integer().optional().min(1).max(25) # min = 1, max = 25
    })
)
def search_users():
    query = request.args.get("q")
    limit = int(request.args.get("limit", 10))

    res = Session.query(Teacher) \
        .filter(Teacher.name.like(f"%{query}%")) \
        .limit(limit) \
        .all()

    return jsonify([
        teacher.to_dict(['id', 'name'])
        for teacher in res
    ])
def search_users():
    pass