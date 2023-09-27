from flask import Blueprint, request, jsonify, abort
from api.db import Session
from api.db.dict import Encode, Iterate, Place, Rename, NullEncodeOption
from api.db.id import IdPrefix, generate_id
from api.db.models.assessment import AssessmentType
from api.db.models.assessment_score import AssessmentScore
from api.db.models.assessment_comment import AssessmentComment
from api.db.models.department import Department
from api.db.models.grading_system import GradingSystem
from api.db.models.student import Student
from api.db.models.teacher import Teacher, TeacherRole
from api.db.models.year import Year

from api.lib.resolved import Resolved
from api.db.paginate import paginate, PaginationArguments

from api.middleware.authenticate import authenticate, get_user
from api.middleware.validate import validate

import api.lib.validate as rules
from api.lib.error.local import LocalError, LocalErrorCode
import api.lib.validate as rules

from api.db.models import Assessment, Class

from sqlalchemy import or_
from sqlalchemy.orm import joinedload

blueprint = Blueprint("assessments", __name__)

@blueprint.get("/assessments/constructs")
@authenticate()
def get_constructs():
    user_id = get_user().id

    grading_systems = Session.query(GradingSystem) \
        .filter(or_(GradingSystem.public == True, GradingSystem.author_id == user_id)) \
        .all()

    departments = Session.query(Department) \
        .filter(Department.lead_id == user_id) \
        .all()

    years = Session.query(Year) \
        .all() if len(departments) > 0 else []

    classes = Class.visible(user_id)

    merged = [
        *[
            { **department.to_dict(['id', 'name']), 'type': 'department' }
            for department in departments 
        ],
        *[
            { **cls.to_dict(['id', ('code', 'name')]), 'type': 'class' }
            for cls in classes 
        ],
        *[
            { **yr.to_dict(['id', ('final_year', 'name')]), 'type': 'year'}
            for yr in years
        ]
    ]

    return {
        'grading_systems': [
            sys.to_dict(['id', 'name', ('grades', 'data')])
            for sys in grading_systems
        ],
        'targets': merged
    }

@blueprint.get("/assessments")
@authenticate()
@validate(
    query=rules.object({
        "page": rules.integer().optional(),
        "per_page": rules.integer().optional().min(1).max(100) # min per page = 1, max per page = 100
    })
)
def list_assessments():
    page = int(request.args.get("page", 0))
    per_page = int(request.args.get("per_page", 25)) # TODO(2): doc error (forget to cast)

    # BEGIN query
    assessments = Session.query(Assessment)

    def mapper(ass, ctx):
        return ass.to_dict([
            'id',
            'name',
            'type',
            'max_marks',
            'grade_boundaries',
            'flags',
            Encode('year', [
                'id',
                'final_year'
            ], on_null=NullEncodeOption.Skip),
            Encode('cls', [
                'id',
                'code'
            ], on_null=NullEncodeOption.Skip, target='class'),
            Encode('department', [
                'id',
                'name'
            ], on_null=NullEncodeOption.Skip),
            Encode('grading_system', [
                'id',
                Rename('grades', 'data')
            ]),
            Place({
                'has_scores': len(ass.scores) != 0,
                'can_submit_scores': len(ass.scores) == 0 and (ass.department.lead_id == ctx.user.id if ass.type == AssessmentType.YEAR else ctx.user in ass.cls.teachers)
            })
        ])
    
    return paginate(
        query=assessments,
        args=PaginationArguments(
            page=page,
            per_page=per_page,
            mapper=mapper
        )
    )

@blueprint.post("/assessments")
@authenticate()
@validate(
    json=rules.variant("type", {
        "year": rules.object({
            "name": rules.string(),
            "type": rules.any(),
            "year_id": rules.exists(Year),
            "department_id": rules.exists(Department),
            "grading": rules.object({
                "boundaries": rules.array(rules.integer()),
                "system_id": rules.exists(GradingSystem)
            }),
            "max_marks": rules.integer().min(1)
        }),
        "class": rules.object({
            "name": rules.string(),
            "type": rules.any(),
            "class_id": rules.exists(Class),
            "grading": rules.object({
                "boundaries": rules.array(rules.integer()),
                "system_id": rules.exists(GradingSystem)
            }),
            "max_marks": rules.integer().min(1)
        })
    })
)
def create_assessment():
    data = request.get_json()
    discrim = data.get("type")
    args = args_for(discrim, data)

    grading_system = Resolved.get(data.get("grading").get("system_id"))

    boundaries = data.get("grading").get("boundaries")

    # if the number of boundaries != number of grades in system, or
    # the unique boundaries does not equal all the boundaries
    if len(boundaries) != len(grading_system.grades) or len(set(boundaries)) != len(boundaries):
        raise LocalError(LocalErrorCode.INVALID_GRADE_BOUNDARIES)

    boundaries.sort(reverse=True)

    # TODO(1): doc error resolution (pass grading_system_id)
    asm = Assessment(
        id=generate_id(IdPrefix.Assessment),
        max_marks=data.get("max_marks"),
        name=data.get("name"),
        grade_boundaries=boundaries,
        flags=0,
        grading_system_id=data.get("grading").get("system_id"),
        **args
    )

    Session.add(asm)
    Session.commit()

    return asm.to_dict([
        'id',
        'name',
        'type',
        'max_marks',
        'flags'
    ]), 201


def args_for(t, data):
    if t == "year":
        return {
            "department_id": data.get("department_id"),
            "year_id": data.get("year_id"),
            "type": AssessmentType.YEAR
        }

    if t == "class":
        return {
            "class_id": data.get("class_id"),
            "type": AssessmentType.CLASS
        }

    return dict()

@blueprint.get("/assessments/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(Assessment)
    })
)
def get_assessment(id):
    ass = Resolved.get(id)
    user = get_user()

    students = list(map(lambda x: x.student, ass.cls.students)) if ass.type == AssessmentType.CLASS else Assessment.get_students_for_department(
        ass.year_id,
        ass.department_id
    )

    return ass.to_dict([
        'id',
        'name',
        'type',
        'max_marks',
        'grade_boundaries',
        'flags',
        Encode('year', [
            'id',
            'final_year'
        ], on_null=NullEncodeOption.Skip),
        Encode('cls', [
            'id',
            'code'
        ], on_null=NullEncodeOption.Skip, target='class'),
        Encode('department', [
            'id',
            'name'
        ], on_null=NullEncodeOption.Skip),
        Encode('grading_system', [
            'id',
            Rename('grades', 'data')
        ]),
        Place({
            'students': [
                student.to_dict(['id', 'name'])
                for student in students
            ],
            'has_scores': len(ass.scores) != 0,
            'can_submit_scores': len(ass.scores) == 0 and (ass.department.lead_id == user.id if ass.type == AssessmentType.YEAR else user in ass.cls.teachers)
        })
    ])

@blueprint.post("/assessments/<asm_id>/results")
@authenticate()
@validate(
    json=rules.array(rules.object({
        "student_id": rules.exists(Student),
        "marker_id": rules.exists(Teacher),
        "score": rules.integer().min(0),
        "flags": rules.integer().optional()
    })),
    path=rules.object({
        'asm_id': rules.exists(Assessment)
    })
)
def post_results(asm_id):
    data = request.get_json()
    asm = Resolved.get(asm_id)

    # TODO(3): forgot this check
    if len(asm.scores) != 0:
        abort(409)

    students = asm.cls.students if asm.type == AssessmentType.CLASS else Assessment.get_students_for_department(
        asm.year_id,
        asm.department_id
    )

    provided_ids = [score.get("student_id") for score in data]

    # if the unique set of ids does not match 
    # the length of the students in the class,
    # then some ids are missing or duplicated
    #
    # .: not acceptable
    same_len_unique_scores_as_len_students = len(set(provided_ids)) == len(students)

    if not same_len_unique_scores_as_len_students:
        raise LocalError(LocalErrorCode.ASSESSMENT_SCORE_STUDENTS_PRECONDITION_FAILURE)

    # if at least one of the scores exceeds
    # max marks for assessment, then there
    # is an error in the data provided
    #s
    # .: not acceptable
    score_too_large = any([score.get("score") > asm.max_marks for score in data])

    if score_too_large:
        raise LocalError(LocalErrorCode.ASSESSMENT_SCORE_EXCEEDS_MAX_MARKS)

    # generate all the models for scores
    # as an array
    scores = [
        AssessmentScore(
            id=generate_id(IdPrefix.AssessmentScore),
            mark=score.get("score"),
            flags=score.get("flags", 0),
            student_id=score.get("student_id"),
            marker_id=score.get("marker_id"),
            assessment_id=asm_id
        ) for score in data
    ]

    # add them for committing
    for score in scores:
        Session.add(score)

    # commit them all
    Session.commit()

    return "", 204

@blueprint.get("/assessments/<id>/comments")
@validate(
    path=rules.object({
        'id': rules.exists(Assessment)
    })
)
def get_assessment_comments(id):
    results = Session.query(AssessmentComment) \
        .filter(AssessmentComment.assessment_id == id) \
        .options(joinedload(AssessmentComment.children)) \
        .all()

    return jsonify([
        res.to_dict([
            'id',
            'content',
            Encode('author', [
                'id',
                'name'
            ]),
            Iterate('children', [
                'id',
                'content',
                Encode('author', [
                    'id',
                    'name'
                ])
            ])
        ]) for res in list(filter(lambda x: x.parent_id is None, results))
    ])

@blueprint.post("/assessments/<id>/comments")
@authenticate()
@validate(
    json=rules.object({
        "content": rules.string(),
        "parent_id": rules.exists(AssessmentComment).optional()
    }),
    path=rules.object({
        'id': rules.exists(Assessment)
    })
)
def post_comment(id):
    data = request.get_json()
    user = get_user()

    comment = AssessmentComment(
        id=generate_id(IdPrefix.AssessmentComment),
        **data,
        author_id=user.id,
        assessment_id=id
    )

    Session.add(comment)
    Session.commit()

    return {
        "id": comment.id
    }, 201

@blueprint.get("/assessments/search")
@validate(
    query=rules.object({
        "q": rules.string(),
        "current_assessment_id": rules.exists(Assessment),
        "limit": rules.integer().min(1).max(50).optional()
    })
)
def get_tests_by_name():
    query = request.args.get("q")
    current_assessment_id = request.args.get("current_assessment_id")
    limit = int(request.args.get("limit", 25))

    assessments = Session.query(Assessment) \
        .filter(Assessment.name.like(f"%{query}%")) \
        .filter(Assessment.id != current_assessment_id) \
        .limit(limit) \
        .all()

    return jsonify([assessment.to_dict(['id', 'name']) for assessment in assessments])