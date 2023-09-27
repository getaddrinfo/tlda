import datetime
import logging
import re
from typing import Optional
from flask import abort, request, g as flask_global, current_app

from functools import wraps

from api.db import Session
from api.db.models.auth import Auth
from sqlalchemy.orm import joinedload

from api.db import engine
from api.db.models.teacher import Teacher
from api.lib.token import sha1

from sqlalchemy.dialects import postgresql

logger = logging.getLogger(__name__)


CURRENT_USER_KEY = "current_user"
TOKEN_REGEX = re.compile(rf'{current_app.config["SCHOOL_ACRONYM"]}_[\w\-]{0,64}')

def authenticate():
    def authenticate_impl(f):
        @wraps(f)
        def wrapper(*args, **kwargs):   
            # If they haven't specified an
            # authorization header
            if "authorization" not in request.headers:
                abort(401)

            # Split the token into two parts, Bearer and <token>
            # header should look like:
            # Authorization: Bearer <token>
            token = request.headers["authorization"]               
            split = token.split(" ")


            # if we didn't split it into two parts, or
            # the first part isn't Bearer, or
            # the length of the token itself isn't 64
            if len(split) != 2 or split[0] != "Bearer" or TOKEN_REGEX.match(split[1]) is None:
                abort(401)

            data = sha1(split[1]).hex().upper()

            # Load the Auth associated with this token
            # and preload a teacher if possible.
            data = engine.execute(
fr"""
SELECT auth.teacher_id, auth.created_at, auth.expires_after FROM auth
WHERE auth.token_hash = '\x{data}'
"""
            ).first()

            # If we didn't get the data,
            # or the session is expired
            if data is None or datetime.datetime.now() > (data.created_at + datetime.timedelta(seconds=data.expires_after)):
                abort(401)

            # this is slightly inefficient,
            # but we are not receiving thousands of requests per second
            # so it shouldn't be an issue
            # 
            # if we care enough, we can create a cache in something like redis
            # of token_hash -> teacher_id
            teacher = Session.get(Teacher, data.teacher_id)

            if not teacher:
                logger.error("auth found but no associated teacher, id = {}".format(data.teacher_id))
                abort(500)

            # set teacher into the global
            # request context
            set_user(teacher)

            # call the next function
            return f(*args, **kwargs)

        return wrapper

    return authenticate_impl
    
def nullable_get_user() -> Optional[Teacher]:
    return getattr(flask_global, CURRENT_USER_KEY, None)

def get_user() -> Teacher:
    teacher = nullable_get_user()

    # assert that the teacher is loaded,
    # or raise an AssertionError if it isn't.
    assert teacher is not None, "teacher must be set to access via get_user"
    return teacher

def set_user(teacher: Teacher):
    setattr(flask_global, CURRENT_USER_KEY, teacher)