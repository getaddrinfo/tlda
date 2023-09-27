from enum import Enum
from typing import Dict

from .type import BaseTypeValidator

from .types.array import ArrayValidator
from .types.enum import EnumValidator
from .types.integer import IntegerValidator
from .types.object import ObjectValidator
from .types.string import StringValidator
from .types.variant import VariantValidator
from .types.date import DateValidator
from .types.any import AnyValidator
from .types.boolean import BooleanValidator
from .types.model import ModelExistenceValidator

__all__ = ("array", "enum", "integer", "object", "string", "variant", "date", "any")

def array(type: BaseTypeValidator) -> ArrayValidator:
    return ArrayValidator(type)

def enum(enum: Enum) -> EnumValidator:
    return EnumValidator(enum)

def integer() -> IntegerValidator:
    return IntegerValidator()

def object(data: Dict[str, BaseTypeValidator]) -> ObjectValidator:
    return ObjectValidator(data)

def string() -> StringValidator:
    return StringValidator()

def variant(upon: str, variants: Dict[str, ObjectValidator]) -> VariantValidator:
    return VariantValidator(
        variants,
        upon
    )
    
def date():
    return DateValidator()

def any():
    return AnyValidator()

def boolean():
    return BooleanValidator()

def exists(model):
    return ModelExistenceValidator(model)