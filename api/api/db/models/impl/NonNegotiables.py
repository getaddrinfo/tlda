from typing import List, Union
from typing_extensions import Self
import sqlalchemy as sa
from dataclasses import dataclass

from sqlalchemy.dialects import postgresql

@dataclass
class NonNegotiableValue:
    challenge: bool
    pace: bool
    modelling: bool
    questioning: bool

class NonNegotiables(sa.types.TypeDecorator):
    _value: Union[NonNegotiableValue, None] = None
    impl = postgresql.ARRAY(sa.Boolean)

    def __init__(self, value = None):
        self._value = value

    # converts from NonNegotiables to something
    # sqlalchemy can interpret
    def process_bind_param(self, value: Self, _):
        if value._value is None:
            raise RuntimeError("cannot bind None value")
        
        value = value._value

        return [
            value.challenge,
            value.pace,
            value.modelling,
            value.questioning
        ]

    # converts from result from db
    # to a NonNegotiables
    def process_result_value(self, value: List[bool], _):
        return NonNegotiables(NonNegotiableValue(
            value[0], # challenge
            value[1], # pace
            value[2], # modelling
            value[3]  # questioning
        ))