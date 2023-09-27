from enum import Enum
from typing import List, Optional
from typing_extensions import Self

from ..type import BaseTypeValidator
from ..error import Path, ValidationError

class RuleType(Enum):
    ComputedSet = "computed_set"
    Computed = "computed"

class EnumValidator(BaseTypeValidator):
    def __init__(self, enum: Enum):
        super().__init__("enum") # initialise the BaseTypeValidator constructor that we are derived from

        self._rules[RuleType.Computed] = [v.value for v in enum] # get all the values of an enum
        self._rules[RuleType.ComputedSet] = set([v.value for v in enum])

    def validate(self, data, path: Optional[Path]):
        errors = []
        make_error = ValidationError.creator(path)

        values: List[Enum] = self._rules[RuleType.Computed]
        computed_set = self._rules[RuleType.ComputedSet]

        # If the data is not an instance of the enum's value type (used to represent an enum's options),
        # or the value isn't in the enum's values, add an error
        if not data in computed_set:
            errors.append(make_error(
                "Value is not one of ({})".format(", ".join([str(value) for value in values])),
                "COERCE_TYPE_ENUM"
            ))    

        return errors

