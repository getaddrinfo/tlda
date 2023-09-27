from enum import Enum
from typing import List, Optional
from typing_extensions import Self

from ..type import BaseTypeValidator
from ..error import Path, ValidationError

class RuleType(Enum):
    Min = "min"
    Max = "max"
    Range = "range"

class IntegerValidator(BaseTypeValidator):
    def __init__(self):
        super().__init__("integer") # initialise the BaseTypeValidator constructor that we are derived from.

    def min(self, value: int) -> Self:
        self._rules[RuleType.Min] = value

        return self

    def max(self, value: int) -> Self:
        self._rules[RuleType.Max] = value
        return self

    def range(self, values: List[int]) -> Self:
        self._rules[RuleType.Range] = values
        return self
    

    def validate(self, data, path: Optional[Path]):
        errors = []
        make_error = ValidationError.creator(path)

        if self.should_cast:
            try:
                data = int(data)
            except ValueError:
                data = None

        # If the data is not an instance of an integer,
        # return early
        if not isinstance(data, int):
            errors.append(make_error(
                "Value is not a valid integer",
                "COERCE_TYPE_INT"
            ))

            return errors
        
        # validator.min(int)
        if self.defined_rule(RuleType.Min):
            min = self.get_rule_value(RuleType.Min)

            # too small?
            if data < min:
                errors.append(make_error(
                    "Value is less than minimum ({})".format(min),
                    "INT_TOO_SMALL"
                ))

        # validator.max(int)
        if self.defined_rule(RuleType.Max):
            max = self.get_rule_value(RuleType.Max)

            # too big?
            if data > max:
                errors.append(make_error(
                    "Value is greater than maximum ({})".format(max),
                    "INT_TOO_BIG"
                ))

        if self.defined_rule(RuleType.Range):
            range = self.get_rule_value(RuleType.Range)

            # not in provided range?
            if not data in range:
                errors.append(make_error(
                    "Value is not in expected values ({})".format(", ".join(range)),
                    "INT_NOT_IN_RANGE"
                ))

        return errors
        