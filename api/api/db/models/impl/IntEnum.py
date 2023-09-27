# based on https://stackoverflow.com/questions/33612625/how-to-model-enums-backed-by-integers-with-sqlachemy
import sqlalchemy as sa

class IntEnum(sa.types.TypeDecorator):
    impl = sa.Integer

    def __init__(self, enum, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._underlying_value = enum

    def process_bind_param(self, value, _):
        return value.value

    def process_result_value(self, value, _):
        return self._underlying_value(value)