# typing
from enum import Enum

from http import HTTPStatus as Status
import logging # provides enum of http statuses
from flask import jsonify # json serialiser

logger = logging.getLogger(__name__)

from api.db.models import *

# represents all the errors that can be raised
class LocalErrorCode(Enum):
    UNKNOWN_TEACHER = (1001, "Unknown Teacher", Status.NOT_FOUND)
    UNKNOWN_SESSION = (1002, "Unknown Session", Status.NOT_FOUND)
    UNKNOWN_DEPARTMENT = (1003, "Unknown Department", Status.NOT_FOUND)
    UNKNOWN_EVENT = (1004, "Unknown Event", Status.NOT_FOUND)
    UNKNOWN_WATCH_REQUEST = (1005, "Unknown Watch Request", Status.NOT_FOUND)
    UNKNOWN_SCHEDULED_REVIEW = (1006, "Unknown Scheduled Review", Status.NOT_FOUND)
    UNKNOWN_CLASS = (1007, "Unknown Class", Status.NOT_FOUND)
    UNKNOWN_GRADING_SYSTEM = (1008, "Unknown Grading System", Status.NOT_FOUND)
    UNKNOWN_ASSESSMENT = (1009, "Unknown Assessment", Status.NOT_FOUND)
    UNKNOWN_ASSESSMENT_SCORE = (1010, "Unknown Assessment Score", Status.NOT_FOUND)
    UNKNOWN_ASSESSMENT_COMMENT = (1011, "Unknown Assessment Comment", Status.NOT_FOUND)
    UNKNOWN_AUTH = (1012, "Unknown Auth", Status.NOT_FOUND)
    UNKNOWN_NOTIFICATION = (1013, "Unknown Notification", Status.NOT_FOUND)
    UNKNOWN_REVIEW_RESULT = (1014, "Unknown Review Result", Status.NOT_FOUND)
    UNKNOWN_STUDENT = (1015, "Unknown Student", Status.NOT_FOUND)
    UNKNOWN_YEAR = (1016, "Unknown Year", Status.NOT_FOUND)


    PASSWORDS_NOT_EQUAL = (2001, "Passwords Do Not Match", Status.BAD_REQUEST)
    MISSING_ACCESS = (4001, "Missing Access", Status.FORBIDDEN)
    VALIDATION_FAILED = (5000, "Validation Failed", Status.BAD_REQUEST)

    ASSESSMENT_GRADE_BOUNDARIES_MISMATCH = (20001, "Mismatch between Grade boundaries and Grading System", Status.BAD_REQUEST)
    ASSESSMENT_SCORE_STUDENTS_PRECONDITION_FAILURE = (20002, "Students provided do not satisfy conditions", Status.BAD_REQUEST)
    ASSESSMENT_SCORE_EXCEEDS_MAX_MARKS = (20003, "Score provided exceeds max marks", Status.BAD_REQUEST)
    ASSESSMENT_HAS_NO_SCORES = (20004, "Assessment has no registered results", Status.NOT_FOUND)


# wrapper for errors
# usage: raise LocalError(LocalErrorCode.CODE)
class LocalError(Exception):
    code: int
    message: str
    status: int

    def __init__(self, error: LocalErrorCode):
        (code, message, status) = error.value # destructure the argument into each component (int, str, Status)

        self.code = code
        self.message = message
        self.status = status.value # get the http code from it

MAP_MODEL_TO_LOCAL_ERROR_CODE = {
    Assessment: LocalErrorCode.UNKNOWN_ASSESSMENT,
    AssessmentScore: LocalErrorCode.UNKNOWN_ASSESSMENT_SCORE,
    AssessmentComment: LocalErrorCode.UNKNOWN_ASSESSMENT_COMMENT,
    Auth: LocalErrorCode.UNKNOWN_AUTH,
    Class: LocalErrorCode.UNKNOWN_CLASS,
    Department: LocalErrorCode.UNKNOWN_DEPARTMENT,
    Event: LocalErrorCode.UNKNOWN_EVENT,
    GradingSystem: LocalErrorCode.UNKNOWN_GRADING_SYSTEM,
    Notification: LocalErrorCode.UNKNOWN_NOTIFICATION,
    ReviewResult: LocalErrorCode.UNKNOWN_REVIEW_RESULT,
    ScheduledReview: LocalErrorCode.UNKNOWN_SCHEDULED_REVIEW,
    Student: LocalErrorCode.UNKNOWN_STUDENT,
    Teacher: LocalErrorCode.UNKNOWN_TEACHER,
    WatchRequest: LocalErrorCode.UNKNOWN_WATCH_REQUEST
}

# the actual handler of the error
def handle_local_error(e: LocalError):
    logger.debug(e)

    # serialise to json
    # and return with status code of e.status
    # defined in LocalErrorCode enum

    # TODO(13): serialize with wrong key
    return jsonify({
        "message": e.message,
        "code": e.code,
    }), e.status

def ensure_error_enum_values_unique():  
    unique = set() # unique codes

    for error in LocalErrorCode: # Enum has __iter__ defined, so we can iterate over it as shown.
        (code, _, _) = error.value # destructure to get code

        unique.add(code) # add to set
    
    count_local_errors = len(LocalErrorCode) # all error codes, Enum defines __len__ so this can be performed
    count_unique_errors = len(unique) # unique error codes

    # if they are different, raise an exception
    if count_unique_errors != count_local_errors: 
        raise Exception("unique LocalErrorCode does not match length of LocalErrorCode" +
            "unique = {0}, total = {1}".format(count_unique_errors, count_local_errors))