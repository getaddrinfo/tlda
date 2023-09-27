import enum
from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from .. import Base, relationship

class NotificationType(enum.Enum):
    important = 'important'

class Notification(Base):
    __tablename__ = "notification"

    id = Column(String(20), primary_key=True)
    dismissed = Column(Boolean)
    type = Column(Enum(NotificationType))
    data = Column(JSON)
    created_at = Column(DateTime)

    teacher_id = Column(String(20), ForeignKey("teacher.id"))

    # relationships
    teacher = relationship("Teacher", back_populates="notifications")
