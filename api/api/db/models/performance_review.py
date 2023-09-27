import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from .. import Base, relationship

class ReviewQualityType(enum.Enum):
    Positive = "POSITIVE"
    Neutral = "NEUTRAL"
    Negative = "NEGATIVE"

class PerformanceReview(Base):
    __tablename__ = "performance_review"

    id = Column(String(20), primary_key=True)
    overall = Column(Enum(ReviewQualityType))
    non_negotiables = Column(Integer)
    student_work_quality = Column(Integer)
    commentary = Column(Text)
    created_at = Column(DateTime)

    teacher_id = Column(String(20), ForeignKey("teacher.id"))
    assesser_id = Column(String(20), ForeignKey("teacher.id"))

    teacher = relationship("Teacher", foreign_keys=[teacher_id])
    assesser = relationship("Teacher", foreign_keys=[assesser_id])