from flask import Blueprint, request, jsonify
from api.db.dict import Encode, Rename

from api.middleware.validate import validate
from api.middleware.authenticate import authenticate, get_user
from api.db.models.grading_system import GradingSystem
from api.db.id import generate_id, IdPrefix
from api.db import Session

import api.lib.validate as rules

blueprint = Blueprint("grading_system", __name__)

@blueprint.post("/grading-systems")
@validate(
    json=rules.object({
        "name": rules.string().min_len(1).max_len(64),
        "public": rules.boolean(),
        "data": rules.array(rules.string().max_len(4))
    })
)
@authenticate()
def create_grading_system():
    data = request.get_json()

    grading_system = GradingSystem(
        id=generate_id(IdPrefix.GradingSystem),
        public=data.get("public"),
        name=data.get("name"),
        grades=data.get("data"),
        author_id=get_user().id
    )

    Session.add(grading_system)
    Session.commit()

    return grading_system.to_dict([
        'id',
        'name',
        'public',
        ('grades', 'data')
    ]), 201


@blueprint.get("/grading-systems")
@authenticate()
def get_grading_system():
    systems = Session.query(GradingSystem) \
        .filter(GradingSystem.public == True) \
        .all()

    return jsonify([
        gs.to_dict([
            'id',
            'name',
            'public',
            Rename('grades', 'data'),
            Encode('author', [
                'id',
                'name',
                'email'
            ])
        ])
        for gs in systems
    ])