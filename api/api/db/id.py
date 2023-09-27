import snowflake, threading, re, base62

from enum import Enum
from os import urandom
from typing import Dict

from . import Base
from .models import *

class SnowflakeGenerator:
    # represents the underlying
    # generator of snowflake ids, with
    # an epoch of 1669507200000 (27/11/2022, 00:00:00)
    gen = snowflake.SnowflakeGenerator(
        0,
        epoch=1669507200000
    )

    # represents a lock to ensure that 
    # we do not do weird sequence modifications
    # across threads
    lock = threading.Lock()

    def __iter__(self):
        return self

    def __next__(self):
        self.lock.acquire(blocking=True)
        id = next(self.gen)
        self.lock.release()

        return id

generator = SnowflakeGenerator()

__all__ = (
    "IdPrefix",
    "generate_id",
    "ID_REGEX",
    "ID_PREFIX_TO_MODEL"
)

class IdPrefix(Enum):
    Assessment = "ass"
    AssessmentScore = "assc"
    AssessmentComment = "ascm"
    Department = "dep"
    Event = "evt"
    Notification = "ntf"
    PerformanceReview = "prf"
    ProgressReview = "prg"
    Student = "std"
    Teacher = "tch"
    WatchRequest = "wtc"
    Year = "yr"
    ReviewResult = "rrs"
    ScheduledReview = "srv"
    GradingSystem = "grs"
    Class = "cls"


ID_PREFIX_TO_MODEL: Dict[str, Base] = {
    IdPrefix.Assessment.value: Assessment,
    IdPrefix.AssessmentScore.value: AssessmentScore,
    IdPrefix.AssessmentComment.value: AssessmentComment,
    IdPrefix.Department.value: Department,
    IdPrefix.Event.value: Event,
    IdPrefix.Notification.value: Notification,
    IdPrefix.PerformanceReview.value: PerformanceReview,
    IdPrefix.ProgressReview.value: ProgressReview,
    IdPrefix.Student.value: Student,
    IdPrefix.Teacher.value: Teacher,
    IdPrefix.WatchRequest.value: WatchRequest,
    IdPrefix.Year.value: Year,
    IdPrefix.ReviewResult.value: ReviewResult,
    IdPrefix.ScheduledReview.value: ScheduledReview,
    IdPrefix.GradingSystem.value: GradingSystem,
    IdPrefix.Class.value: Class
}

def generate_id_regex() -> re.Pattern:
    prefixes = "|".join([e.value for e in IdPrefix])

    rgx = r"(" + prefixes + ")_[\w+]{0,19}"
    
    return re.compile(rgx)

ID_REGEX = generate_id_regex()

def generate_id(prefix: IdPrefix):
    # gets the next id
    id = next(generator)

    # encodes it in base62
    encoded = base62.encode(id)

    # prefixes it with the prefix for the id
    formatted = f"{prefix.value}_{encoded}"

    return formatted
