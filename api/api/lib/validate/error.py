from typing import Any, Callable, Optional, Tuple

Path = Tuple[str, ...]


# Represents an error produced when validating.
# Returned by Type.validate(data)
class ValidationError:
    code: str # the unique code for this error
    message: str # the message for the client to see
    path: Path # where this happened in the data tree provided

    def __init__(self, message: str, code: str, path: Optional[Path]):
        self.message = message
        self.code = code
        self.path = path if path is not None else ()

    
    # This method is simply a utility method
    # that can be used to simplify creating errors
    # with a known path.
    @staticmethod
    def creator(path: Path) -> Callable[[str, str], Any]:
        def make_fn(message: str, code: str):
            return ValidationError(message, code, path)

        return make_fn

    # a utility method that transforms a
    # ValidationError into a dict that can
    # be easily converted to json.
    def to_dict(self):
        return {
            'code': self.code,
            'message': self.message
        }
