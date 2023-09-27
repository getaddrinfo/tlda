from flask import Blueprint, request, jsonify
from api.db.models.teacher import TeacherRole

from api.middleware.authenticate import authenticate, get_user
from api.middleware.validate import validate

from api.db import Session
from api.db.models import Class
from sqlalchemy import text, bindparam

from api.lib.validate import integer, object, string
from api.db.paginate import paginate, PaginationArguments


blueprint = Blueprint("lessons", __name__)

# selects all the IDs of classes that a teacher
# can see by being a part of a department

# select distinct class ids where
# the teacher is a part of the 
# department
SUBQUERY_TEACHER_IN_DEPARTMENT = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN ref_teacher_to_department AS ref_ttd
ON ref_ttd.teacher_id = :current_teacher_id
WHERE class.department_id = ref_ttd.department_id
"""

# selects all the IDs of classes that a teacher
# can see by being the lead of a department

# select distinct class ids where
# the department the class is associated 
# with is lead by the current teacher
SUBQUERY_TEACHER_IS_DEPARTMENT_LEAD = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN department AS d
ON d.lead_id = :current_teacher_id
WHERE class.department_id = d.id
"""

# selcts all the IDs of classes that a teacher
# can see by teaching a class

# select distinct class ids where
# the teacher teaches the class
SUBQUERY_TEACHER_TEACHES_CLASS = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN ref_class_to_teacher AS ref_ctt
ON ref_ctt.teacher_id = :current_teacher_id
WHERE ref_ctt.class_id = class.id
"""

# all conditions joined to provide
# a determinant result
SELECT_JOINED = f"""
SELECT DISTINCT(class.id) FROM class
WHERE class.id IN ({ SUBQUERY_TEACHER_IN_DEPARTMENT }) OR class.id IN ({ SUBQUERY_TEACHER_IS_DEPARTMENT_LEAD }) OR class.id IN ({ SUBQUERY_TEACHER_TEACHES_CLASS })
"""

@blueprint.get("/lessons")
@validate(
    query=object({
        "page": integer().optional(),
        "per_page": integer().optional().min(1).max(100) # min per page = 1, max per page = 100
    })
)
@authenticate()
def get_lessons():
    # pagination info
    page = int(request.args.get("page", 0))
    per_page = int(request.args.get("per_page", 25))

    # current user
    teacher = get_user()

    # BEGIN query
    classes = Session.query(Class)
    
    # if not SLT or ADMIN, hide 
    # classes that they should not
    # be able to see.

    # classes that they can see are:
    # - classes in their department
    # - classes in departments they lead

    if teacher.role == TeacherRole.TEACHER:
        # TODO(4): bind with invalid param name
        classes = classes \
            .filter(Class.id.in_(
                text(SELECT_JOINED) \
                    .bindparams(bindparam('current_teacher_id', teacher.id))
                )
            )

    def mapper(cls, _):
        # positive value implies target_grade greater than current grade (student below target)
        # zero value implies target_grade equal to current_grade (student on target)
        # negative value implies current_grade greater than target (student above target)
        grades = [student.target_grade - student.current_grade for student in cls.students]

        # utility function that allows us to calculate
        # the length of results based on a condition
        # that is applied from filtering the list of grades
        # by a fn passed to it, taking the fitlered result (an iterator),
        # coercing to a list, and then taking the length of that list.
        len_from_filtered_grades = lambda fn: len(list(filter(fn, grades)))

        return {
            'id': cls.id,
            'code': cls.code,
            'teachers': [teacher.to_dict(['id', 'name']) for teacher in cls.teachers],
            'students': len(grades), # number of students == number of grades, as grades is derived from students
            'targets': {
                'above': len_from_filtered_grades(lambda grade: grade < 0),
                'on': len_from_filtered_grades(lambda grade: grade == 0),
                'below': len_from_filtered_grades(lambda grade: grade > 0)
            }
        }

    return paginate(
        query=classes,
        args=PaginationArguments(
            page=page,
            per_page=per_page,
            mapper=mapper
        )
    )


@blueprint.get("/lessons/search")
@validate(
    query=object({
        "q": string().required(),
        "limit": integer().optional().min(1).max(25) # min = 1, max = 25
    })
)
@authenticate()
def search_lessons():
    query = request.args.get("q")
    limit = int(request.args.get("limit", 10))

    res = Session.query(Class) \
        .filter(Class.code.like(f"%{query}%")) \
        .limit(limit) \
        .all()

    return jsonify([
        cls.to_dict(['id', 'code'])
        for cls in res
    ])

