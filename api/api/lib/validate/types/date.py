from typing import Optional
from api.lib.parse import parse_date
from api.lib.validate.error import Path, ValidationError

from ..type import BaseTypeValidator

class DateValidator(BaseTypeValidator):
    def __init__(self):
        super().__init__("date") # initialise the BaseTypeValidator constructor that we are derived from.

    def validate(self, data, path: Optional[Path]):
        errors = []

        # dates must be a string
        if not isinstance(data, str):
            errors.append(ValidationError(
                "COERCE_TYPE_DATE",
                "Value is not a valid date",
                path
            ))

            return errors

        # if this raises an error
        # it is not a valid date time
        try:
            parse_date(data)
        except ValueError as e:
            errors.append(ValidationError(
                "COERCE_TYPE_DATE",
                "Value is not a valid date",
                path
            ))
        

        return errors

