from flask import Blueprint, request, jsonify
from api.middleware.validate import validate
import api.lib.validate as rules

from api.db import Session
from api.db.models import Assessment
from api.db.dict import Iterate, Map, Rename, Encode, Flatten, Place
from api.lib.resolved import Resolved

from api.lib.error.local import LocalError, LocalErrorCode
from api.crunch.assessment import calculate

blueprint = Blueprint("assessments_score", __name__, url_prefix="/assessments/<id>")



@blueprint.get("/results")
@validate(
    query=rules.object({
        "compare_to": rules.exists(Assessment).optional()
    }),
    path=rules.object({
        "id": rules.exists(Assessment)
    })
)
def compare_scores(id):
    # get all the assessments as a list
    # by mapping a filtered list of 
    # ids that can be provided, 
    # guaranteed that all are not None
    assessments = list(map(
            lambda id: Resolved.get(id),
            filter(
                lambda value: value is not None, 
                [id, request.args.get("compare_to", None)]
            )
    ))


    # if any of the assessments have no score
    # then we raise an error
    if any([len(ass.scores) == 0 for ass in assessments]):
        raise LocalError(LocalErrorCode.ASSESSMENT_HAS_NO_SCORES)

    return jsonify([
        ass.to_dict([
            'id',
            'name',
            'type',
            Rename(Iterate('scores', [
                'id',
                'mark',
                'flags',
                Encode('student', [
                    'id',
                    'gender',
                    'name',
                    'flags'
                ]),
                Encode('marker', [
                    'id',
                    'name'
                ])
            ]), 'data'),
            Flatten(['grading_system', 'grades'], target='grading_system'),
            'grade_boundaries',
            Place({
                'statistics': calculate(ass.scores).to_dict()
            })
        ]) for ass in assessments
    ])