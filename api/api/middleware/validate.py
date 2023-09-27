import flask

from typing import Optional
from functools import wraps

from api.lib.error.validation import ValidationException
from api.lib.validate.type import SHOULD_CAST_KEY, BaseTypeValidator
from api.lib.validate.types.object import ObjectValidator
from api.lib.validate.types.model import ModelExistenceValidator

from api.db.id import ID_PREFIX_TO_MODEL
from api.db import Session
from api.lib.error.local import MAP_MODEL_TO_LOCAL_ERROR_CODE, LocalError
from api.lib.resolved import Resolved


def validate(
    *, # denotes that we are making the following params keyword only.
    json: Optional[BaseTypeValidator] = None,
    query: Optional[ObjectValidator] = None,
    path: Optional[ObjectValidator] = None
):
    def validate_impl(f):
        @wraps(f)
        def wrapper(*args, **kwargs):   
            setattr(flask.g, SHOULD_CAST_KEY, False) # used in validators

            errors = []

            # if there are validation rules for json
            if json is not None:
                data = flask.request.get_json()
                errors.extend(json.validate(data, None))

            setattr(flask.g, SHOULD_CAST_KEY, True) # used in validators

            # if there is a query rule
            if query is not None:

                req_args = flask.request.args

                # validate, add to errors array with casting enabled
                errors.extend(query.validate(req_args, None))     

            if path is not None:
                path_params = flask.request.view_args # all the path params

                errors.extend(path.validate(path_params, None))


            setattr(flask.g, SHOULD_CAST_KEY, False) # cleanup for any subsequent validation


            # if there was an error, raise it
            if len(errors) > 0:
                raise ValidationException(errors)  

            # now handle all of the model validations
            unresolved = ModelExistenceValidator.unresolved_futures()

            for (type, values) in unresolved.items():
                ids = [value.id for value in values]
                model = ID_PREFIX_TO_MODEL.get(type)

                # fetches all the models and then converts them 
                # to a dictionary of id -> model so that they
                # can be picked out later on.
                models = {
                    model.id: model for model in Session.query(model) \
                        .filter(model.id.in_(ids)) \
                        .all()
                }

                # if one of these is None, then one model does
                # not exist, so we should raise an error for it
                one_does_not_exist = any([ models.get(value.id) is None for value in values ])

                # gets the error associated with the model, e.g.
                # 1001: Unknown Teacher
                error = MAP_MODEL_TO_LOCAL_ERROR_CODE.get(model)

                if one_does_not_exist:
                    if error is not None:
                        raise LocalError(error)
                    
                    raise Exception(f"unknown model: {model}")

                Resolved.add(models)

            # call the next function
            return f(*args, **kwargs)

        return wrapper

    return validate_impl
    