from enum import Enum
from typing import Optional
from typing_extensions import Self

from api.lib.validate.util import make_local_path
from ..type import BaseTypeValidator
from ..error import Path, ValidationError

class RuleType(Enum):
    MinLen = "min_len"
    MaxLen = "max_len"

class ArrayValidator(BaseTypeValidator):
    t: BaseTypeValidator

    def __init__(self, t: BaseTypeValidator):
        super().__init__("list({})".format(t.name)) # initialise the BaseTypeValidator constructor that we are derived from
        
        self.t = t

    def min_len(self, len: int) -> Self:
        self._rules[RuleType.MinLen] = len
        return self

    def max_len(self, len: int) -> Self:
        self._rules[RuleType.MaxLen] = len
        return self

    def validate(self, data, path: Optional[Path]):
        errors = []

        # if the data provided isn't a list
        # return early
        if not isinstance(data, list):
            errors.append(ValidationError(
                "Value is not a valid array",
                "COERCE_TYPE_ARRAY",
                path
            ))  

            return errors

        if self.defined_rule(RuleType.MinLen):
            value = self.get_rule_value(RuleType.MinLen)

            if len(data) < value:
                errors.append(ValidationError(
                    "Length of value is less than minimum ({})".format(value),
                    "ARRAY_TOO_SHORT",
                    path
                ))
        
        if self.defined_rule(RuleType.MaxLen):
            value = self.get_rule_value(RuleType.MaxLen)
            
            if len(data) > value:
                errors.append(ValidationError(
                    "Length of value exceeds maximum ({})".format(value),
                    "ARRAY_TOO_LONG",
                    path
                ))

        # For each element in the data
        # get the index and its value
        for i, elem in enumerate(data):
            local_path = make_local_path(path, str(i)) # create a new path for it, e.g., property.0
            local_errors = self.t.validate(elem, local_path) # validate it

            errors.extend(local_errors) # extend (append all the elements in local_errors) to the current errors array

        return errors
        