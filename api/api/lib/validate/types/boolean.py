from typing import Optional
from api.lib.validate.error import Path, ValidationError

from ..type import BaseTypeValidator

class BooleanValidator(BaseTypeValidator):
    def __init__(self):
        super().__init__("boolean") # initialise the BaseTypeValidator constructor that we are derived from.

    def validate(self, data, path: Optional[Path]):
        errors = []

        # booleans must be a boolean...
        # duh
        if not isinstance(data, bool):
            errors.append(ValidationError(
                "COERCE_TYPE_BOOLEAN",
                "Value is not a valid boolean",
                path
            ))       

        return errors

