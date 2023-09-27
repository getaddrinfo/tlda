from typing import Dict, Optional

from api.lib.validate.util import make_local_path

from ..type import BaseTypeValidator
from ..error import Path, ValidationError

class ObjectValidator(BaseTypeValidator):
    fields: Dict[str, BaseTypeValidator]

    def __init__(self, fields: Dict[str, BaseTypeValidator]):
        super().__init__("object") # initialise the BaseTypeValidator constructor that we are derived from
        
        self.fields = fields

    # for a large amount of this, we use the
    # "{}.{}".format(path, key) usage. This 
    # produces a path that can represent a nested object, for example
    # if the data {"user":{"id":1}} was provided, and there was an error
    # at data["user"]["id"], then we would want to show the full path to it
    # (user.id), not just the id part. In the case of {"user":{"id":1},"role":{"id":1}}
    # if only id was shown, it would be ambiguous
    def validate(self, data, path: Optional[Path]):
        errors = []

        # if the data is not an object
        if not isinstance(data, dict):
            errors.append(ValidationError(
                "Value is not a valid object",
                "COERCE_TYPE_OBJECT",
                path
            ))

            return errors

        # keys provided in object
        keys = data.keys()

        # keys we expect
        expected_keys = self.fields.keys() 


        # foreach key of keys
        for key in keys:

            # if the key that were provided isn't
            # in the keys that we expect, add
            # an error to the array
            if key not in expected_keys:
                errors.append(ValidationError(
                    "This field is not expected",
                    "UNKNOWN_FIELD",
                    make_local_path(path, key)
                ))
    
        # foreach key of expected keys
        for key in expected_keys:
            present = key in data
            null = present and data[key] is None
            required = self.fields[key]._required

            # if the field is required, but not included
            # in the payload given
            if not present and required:
                errors.append(ValidationError(
                    "This field is required",
                    "FIELD_REQUIRED",
                    make_local_path(path, key)
                ))

            # if the key is present, and it isn't
            # null, validate it.
            if present and not null:
                rule = self.fields[key]
                local_path = make_local_path(path, key)

                # add all the errors (if any) prudced from validation
                # of the field to our errors array.
                errors.extend(rule.validate(data[key], local_path))

        return errors

