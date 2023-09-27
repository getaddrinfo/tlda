from flask import Blueprint, request, abort

from api.db import Session
from api.db.dict import Encode, Place
from api.db.id import IdPrefix, generate_id
from api.db.models.student import Student
from api.db.models.scheduled_review import ReviewResult, ScheduledReview
from api.db.models.impl.NonNegotiables import NonNegotiables, NonNegotiableValue

from api.middleware.authenticate import authenticate, get_user
from api.middleware.validate import validate

from api.lib.error.local import LocalError, LocalErrorCode
import api.lib.validate as rules
from api.lib.resolved import Resolved

blueprint = Blueprint("reviews", __name__)

@blueprint.get("/reviews/<id>")
@authenticate()
@validate(
    path=rules.object({
        'id': rules.exists(ScheduledReview)
    })
)
def get_review_information(id):
    review = Resolved.get(id)

    # fetch data
    reviewer = review.reviewer
    reviewed = review.reviewed
    cls = review.cls
    already_reviewed = review.result_id is not None

    # collect all the students
    # into an array of id + name
    students = [assoc.student.to_dict(['id', 'name']) for assoc in cls.students]

    # return the serialised data
    return review.to_dict([
        'id',
        'type',
        Place({ 'reviewed': already_reviewed }),
        Encode('cls', [
            'id',
            'code'
        ], target='class'),
        Place({
            'teachers': {
                'reviewer': reviewer.to_dict(['id', 'name']),
                'reviewing': reviewed.to_dict(['id', 'name'])
            },
            'students': students
        })
    ])

@blueprint.post("/reviews/<id>")
@authenticate()
@validate(json=rules.object({
    "non_negotiables": rules.object({
        "challenge": rules.boolean(),
        "pace": rules.boolean(),
        "modelling": rules.boolean(),
        "questioning": rules.boolean(),
    }),
    "commentary": rules.object({
        "students": rules.object({
            "challenge": rules.string(),
            "alignment": rules.string(),
            "sen": rules.string(),
            "work_quality": rules.string()
        }),
        "class": rules.variant("type", {
            "ks3": rules.object({}),
            "ks4": rules.object({
                # TODO(6): wrong rule type
                "exam_practice_quality": rules.string()
            }),
            "ks5": rules.object({
                "exam_practice_quality": rules.string()
            })
        }).strip_type()
    }),
    "followup": rules.object({
        "praise": rules.array(rules.exists(Student)),
        "concern": rules.array(rules.exists(Student))
    })
}),
    path=rules.object({
        'id': rules.exists(ScheduledReview)
    })
)
def submit_review(id):
    scheduled_review = Resolved.get(id)

    user = get_user()

    # current user is not the
    # reviewer of this review
    if scheduled_review.reviewer_id != user.id:
        abort(403)

    # there is already a result
    # from the review
    if scheduled_review.result_id is not None:
        abort(409)

    data = request.get_json()

    # data helpers
    non_negotiables = data.get("non_negotiables")
    student_commentary = data.get("commentary").get("students")

    review_id = generate_id(IdPrefix.ReviewResult)

    # create result model
    review = ReviewResult(
        id=review_id,
        non_negotiables=NonNegotiables(NonNegotiableValue(
            non_negotiables['challenge'],
            non_negotiables['pace'],
            non_negotiables['modelling'],
            non_negotiables['questioning']
        )),
        non_negotiables_evidence=student_commentary.get('challenge'),
        student_progress_alignment_commentary=student_commentary.get('alignment'),
        sen_provision_commentary=student_commentary.get('sen'),
        student_work_quality_commentary=student_commentary.get('work_quality'),
        exam_practice_commentary=data.get("commentary").get("class").get("exam_practice_quality")
    )

    # add the review to the db
    Session.add(review)
    Session.commit()

    # assign the result to the scheduled review
    scheduled_review.result_id = review_id

    # commit to db
    Session.commit()

    return "", 204

    