import enum

from sqlalchemy import Column, Enum, String
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import relationship
from .. import Base

from .ref import class_to_teacher, teacher_to_department

class TeacherRole(enum.Enum):
    TEACHER = "TEACHER"
    SLT = "SLT"
    ADMIN = "ADMIN"

class Teacher(Base):
    __tablename__ = "teacher"

    id = Column(String(20), primary_key=True)
    email = Column(String(256))
    password = Column(postgresql.BYTEA(60))
    name = Column(String(256))
    preferred_name = Column(String(60))
    role = Column(Enum(TeacherRole))

    # relationships

    # one -> many
    events = relationship("Event", back_populates="teacher")
    notifications = relationship("Notification", back_populates="teacher")

    progress_reviews_to_me = relationship("ProgressReview", back_populates="teacher", primaryjoin="Teacher.id==ProgressReview.teacher_id")
    progress_reviews_by_me = relationship("ProgressReview", back_populates="assesser", primaryjoin="Teacher.id==ProgressReview.assesser_id")

    performance_reviews_to_me = relationship("PerformanceReview", back_populates="teacher", primaryjoin="Teacher.id==PerformanceReview.teacher_id")
    performance_reviews_by_me = relationship("PerformanceReview", back_populates="assesser", primaryjoin="Teacher.id==PerformanceReview.assesser_id")

    departments_i_lead = relationship("Department", primaryjoin="Teacher.id==Department.lead_id")
    years_i_lead = relationship("Year", primaryjoin="Teacher.id==Year.head_of_year_id")

    watch_requests_to_me = relationship("WatchRequest", primaryjoin="Teacher.id==WatchRequest.target_id")
    watch_requests_from_me = relationship("WatchRequest", primaryjoin="Teacher.id==WatchRequest.requester_id")

    sessions = relationship("Auth")

    # many -> many
    classes = relationship("Class", secondary=class_to_teacher.ref)
    departments = relationship("Department", secondary=teacher_to_department.ref)


    def to_dict(self, fields=None):
        if fields is not None:
            return super().to_dict(fields)

        
        return super().to_dict(['id', 'email', 'name', 'preferred_name', 'role'])