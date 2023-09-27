# typing

import logging

logger = logging.getLogger(__name__)

from typing import Any, List # provides enum of http statuses
from flask import jsonify

from api.lib.error.local import LocalErrorCode # json serialiser

from ..validate.error import Path, ValidationError

# Represents a validation error
class ValidationException(Exception):
    errors: List[ValidationError]

    def __init__(self, errors: List[ValidationError]):
        self.errors = errors


# the actual handler of the error
def handle_validation_error(e: ValidationException):
    # serialise to json
    # and return with status code of e.status
    # defined in LocalErrorCode enum

    (code, _, status) = LocalErrorCode.VALIDATION_FAILED.value

    logger.debug(e)

    return jsonify({
        "message": "Bad Request",
        "code": code,
        "errors": transform_validaton_errors(e.errors)
    }), status.value

# the transformer
def transform_validaton_errors(errors: List[ValidationError]) -> Any:
    out = {}

    for error in errors:
        # put it at the path {error_location}.$errors
        put(out, error.path + ('$errors',), error)

    return out

# recursively put data into an object
# based on the keys remaining
def put(
    object: dict, keys: Path, error: ValidationError
):  
    # if we are putting the final key
    if len(keys) == 1:
        key = keys[0]
        object[key] = object.get(key, [])
        object[key].append(error.to_dict())
    else: # otherwise, there are more keys to put
        key = keys[0] # the next traversal to make
        rest = keys[1:] # remaining keys to set

        if key not in object:
            object[key] = {} # set the object if it doesn't already exist

        put(object[key], rest, error)

        