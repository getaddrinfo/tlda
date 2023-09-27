import enum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship

from .. import Base

class EventType(enum.Enum):
    PROGRESS_REVIEW = "PROGRESS_REVIEW"
    PERFORMANCE_REVIEW = "PERFORMANCE_REVIEW"
    WATCH = "WATCH"

class Event(Base):
    __tablename__ = "event"

    id = Column(String(20), primary_key=True)
    type = Column(Enum(EventType))
    data = Column(JSON)
    scheduled_at = Column(DateTime)

    # ADDED: document
    notify = Column(Boolean, default=False)
    ack = Column(Boolean, default=False)


    teacher_id = Column(String(20), ForeignKey("teacher.id"))

    # relationships 
    teacher = relationship("Teacher", back_populates="events")

    