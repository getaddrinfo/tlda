# The base type that all subtypes inherit from.
# This may be used by types defined in types/{name}.py
# or they may use a derivative from below. 

from typing import Any, List, Optional
from typing_extensions import Self

import flask

from .error import Path, ValidationError

SHOULD_CAST_KEY = "validator__should_cast"

class BaseTypeValidator:
    # the name of this type. used for canoical representation
    name: str
    _required: bool

    # The rules that are applied to this. They do not have to be unique to all types, but must be unique per type.
    _rules: dict

    def __init__(self, name: str):
        self.name = name
        
        self._required = True
        self._rules = {}


    @property
    def should_cast(self):
        return getattr(flask.g, SHOULD_CAST_KEY)

    def optional(self) -> Self:
        self._required = False
        return self

    def required(self) -> Self:
        self._required = True
        return self

    # Performs the validation on data.
    # if it hasn't been implemented, then we raise an error.
    def validate(self, data: Any, path: Optional[Path]) -> List[ValidationError]:
        raise "abstract function has not been implemented by inheriting class"        

    def defined_rule(self, key) -> bool:
        exists = self._rules.get(key) is not None
        return exists

    def get_rule_value(self, key):
        return self._rules[key]
