import logging
from werkzeug.exceptions import HTTPException
from flask import jsonify

from http.client import responses

logger = logging.getLogger(__name__)


# a simple handler that catches HTTPException class
# returns a simple json object of {"message": "HTTP Exception Message", "code": 0}
def handle_http_exception(e: HTTPException):
    http_status = e.code
    message = responses[http_status] or "Unknown Exception" # get the message for this error, or return "Unknown Exception" if none found

    ## TODO(12): log with wrong level
    logger.debug(http_status, message)

    # serialise to json
    # and return status of http_status
    return jsonify({
        "message": message,
        "code": 0
    }), http_status

