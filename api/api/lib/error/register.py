from flask import Flask
from werkzeug.exceptions import HTTPException

from .validation import ValidationException as ValidationError, handle_validation_error
from .local import LocalError, ensure_error_enum_values_unique, handle_local_error
from .http import handle_http_exception

# loads all the exception handlers necessary
def register_exception_handlers(app: Flask):
    ensure_error_enum_values_unique() # ensure our enum error codes are unique

    # register the custom error handler first
    # otherwise its exceptions may be caught as
    # an internal server error which is in no way
    # useful for the end user.
    app.register_error_handler(LocalError, handle_local_error)
    app.register_error_handler(ValidationError, handle_validation_error)

    # then attach the http exception handler
    app.register_error_handler(HTTPException, handle_http_exception)
