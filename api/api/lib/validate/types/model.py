import flask
from typing import Optional, List, Dict
from dataclasses import dataclass
from api.lib.validate.error import Path, ValidationError

from ..type import BaseTypeValidator

from api.db import Base
from api.db.id import ID_REGEX, ID_PREFIX_TO_MODEL

GLOBAL_KEY = "model_glob_future_values"

@dataclass
class UnresolvedFuture:
    id: str
    path: Path

class ModelExistenceValidator(BaseTypeValidator):
    def __init__(self, model):
        if not issubclass(model, Base):
            raise Exception(f"{model.__class__.__name__} does not inherit from Base (model base)")

        super().__init__(f"model({model.__class__.__name__})") # initialise the BaseTypeValidator constructor that we are derived from.
        self.model = model

    def validate(self, data, path: Optional[Path]):
        errors = []
        
        # produces a ValidationError creator for
        # the path
        creator = ValidationError.creator(path)

        # The name of the table, in upper case (will
        # be screaming snake case in actuality)
        table_name = self.model.__tablename__.upper()

        # IDs must be a string
        if not isinstance(data, str):
            errors.append(creator(
                f"COERCE_TYPE_{table_name}_ID",
                "Value is not a valid id"
            ))  
        
        # if there isn't a match then it is
        # not a valid id
        match = ID_REGEX.match(data)

        # if there was no match, it was
        # an invalid id, hence we need
        # to return early as we cannot
        # get a prefix from it
        if match is None:
            errors.append(creator(
                f"COERCE_TYPE_{table_name}_ID",
                "Value is not a valid id"
            ))

            return errors

        (id, prefix) = self.destructure(match)

        # if the model we are checking exists
        # isn't equal to the model associated 
        # with the prefix of the id, then it
        # must not be correct for this context
        if ID_PREFIX_TO_MODEL.get(prefix) != self.model:
            errors.append(creator(
                f"COERCE_TYPE_{table_name}_ID_PREFIX",
                "Value is not an id of the expected type"
            ))

        # adds an unresolved future
        # to the global state for this
        # request
        self.add_unresolved_future(
            id=id,
            prefix=prefix,
            path=path
        )

        return errors

    def destructure(self, match):
        raw = match.string

        prefix = raw.split("_")[0]
        return (raw, prefix)

    def add_unresolved_future(self, id: str, prefix: str, path: Path):
        data = getattr(flask.g, GLOBAL_KEY, dict())

        data[prefix] = [
            *data.get(prefix, []),
            UnresolvedFuture(
                id=id,
                path=path
            )
        ]

        setattr(flask.g, GLOBAL_KEY, data)

    @staticmethod
    def unresolved_futures() -> Dict[str, List[UnresolvedFuture]]:
        return getattr(flask.g, GLOBAL_KEY, dict())
