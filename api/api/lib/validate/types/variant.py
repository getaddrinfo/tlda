from typing import Dict, Optional
from api.lib.validate.error import Path, ValidationError
from api.lib.validate.types.object import ObjectValidator
from api.lib.validate.util import make_local_path

from ..type import BaseTypeValidator

class VariantValidator(BaseTypeValidator):
    _variants: Dict[str, BaseTypeValidator]
    _discriminator: str
    _strip: bool

    def __init__(self, variants: Dict[str, ObjectValidator], upon: str):
        super().__init__("variant") # initialise the BaseTypeValidator constructor that we are derived from.

        self._discriminator = upon
        self._variants = variants
        self._strip = False

    def strip_type(self):
        self._strip = True
        return self

    def validate(self, data, path: Optional[Path]):
        errors = []

        # variants can be nothing but a 
        # dictionary, otherwise there
        # is no data to use as the 
        # discriminator
        if not isinstance(data, dict):
            errors.append(ValidationError(
                "COERCE_TYPE_VARIANT",
                "Value is not a valid variant",
                path
            ))

            return errors

        discrim = None

        if self._strip:
            discrim = data.pop(self._discriminator, None)
        else:
            discrim = data.get(self._discriminator, None)

        if discrim is None:
            errors.append(ValidationError(
                "FIELD_REQUIRED",
                "This field is required",
                make_local_path(path, self._discriminator)
            ))

            return errors

        if discrim not in self._variants.keys():
            errors.append(ValidationError(
                "INVALID_DISCRIMINATOR",
                f"Value must be one of ({', '.join(self._variants.keys())})",
                path
            ))
            
            return errors

        type = self._variants[discrim]
        return type.validate(data, path)



        