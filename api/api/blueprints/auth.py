import re, string
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from sqlalchemy import update, delete

from flask import Blueprint, request, jsonify, abort
import bcrypt

import api.lib.validate as rules
from api.lib.error.local import LocalError, LocalErrorCode
from api.lib.token import generate, sha1
from api.middleware.validate import validate
from api.middleware.authenticate import authenticate, get_user, set_user
from api.db import Session
from api.db.models import Teacher, Auth

from api.db import engine


# via https://stackabuse.com/python-validate-email-address-with-regular-expressions-regex/
EMAIL_REGEX = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
PASSWORD_RULE = rules.string() \
    .min_len(8) \
    .max_len(1024) \
    .chars(
        string.ascii_lowercase + 
        string.ascii_uppercase + 
        string.digits + 
        "!@£$%^&*():;#~-"
    )

class ExpiresAfterOptions(Enum):
    Hour = 3600
    Day = 86400
    Week = 86400 * 7

blueprint = Blueprint("auth", __name__, url_prefix="/auth")



@blueprint.post("/login")
@validate(
    json=rules.object({
        "email": rules.string()
            .matches(EMAIL_REGEX),
        "password": PASSWORD_RULE,
        "expires_after": rules.enum(ExpiresAfterOptions)
            .optional()
    })
)
def login():
    data = request.get_json() # get json payload
    user = Session.query(Teacher).filter(Teacher.email == data['email']).first() # find user

    # if they don't exist
    if not user:
        raise LocalError(LocalErrorCode.UNKNOWN_TEACHER) # Not Found (custom)

    # if their password doesn't match
    if not bcrypt.checkpw(bytes(data['password'], "utf-8"), user.password):
        abort(401) # Unauthorized
    
    # generate and hash the token
    token = generate()
    hash = sha1(token)

    # create auth fields
    created_at = datetime.now()

    expires_after = data.get("expires_after", ExpiresAfterOptions.Hour.value)
    expires_at = created_at + timedelta(seconds=expires_after)
    
    auth = Auth(
        teacher_id = user.id,
        created_at = datetime.now(),
        expires_after = expires_after,
        token_hash = hash
    )

    # add and insert
    Session.add(auth)
    Session.commit()
    
    # return to user
    return jsonify({
        'token': token,
        'expires': expires_at.isoformat()
    })
    

@blueprint.patch("/password")
@authenticate()
@validate(
    json=rules.object({
        "current": PASSWORD_RULE,
        "new": PASSWORD_RULE,
        "new_confirm": PASSWORD_RULE
    })
)
def update_password():
    data = request.get_json()
    teacher = get_user()
    
    if not bcrypt.checkpw(
        bytes(data['current'], "utf-8"),
        teacher.password
    ):
        abort(401)
    
    if not data['new'] == data['new_confirm']:
        raise LocalError(LocalErrorCode.PASSWORDS_NOT_EQUAL)

    hashed = bcrypt.hashpw(
        bytes(data['new'], "utf-8"),
        bcrypt.gensalt(rounds=12)
    )


    # update the teacher
    Session.execute(
        update(Teacher).
        where(Teacher.email == teacher.email).
        values(password = hashed)
    )

    # drop all current sessions
    Session.execute(
        delete(Auth).
        where(Auth.teacher_id == teacher.id)
    )

    Session.commit()

    teacher.password = hashed
    set_user(teacher)

    return "", 204

@blueprint.delete("/session")
@authenticate()
def logout():
    # find the token for this request
    token = request.headers["authorization"].\
        split(" ")[1]

    # form it into a searchable hash    
    findable = sha1(token).hex().upper()

    # run a raw query (string flags: f=formattable, r=raw)
    engine.execute(fr"DELETE FROM auth WHERE auth.token_hash = '\x{findable}'")

    # return 204 no content to signify successfull logout
    return "", 204

def clear_sessions():
    teacher = get_user()

     # drop all current sessions
    Session.execute(
        delete(Auth).
        where(Auth.teacher_id == teacher.id)
    )

    Session.commit()

    # return sessions
    return "", 204