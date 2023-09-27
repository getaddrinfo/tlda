import enum
from sqlalchemy import Column, Enum, ForeignKey, String, Text, func, DateTime
from .. import Base, relationship

from .impl.NonNegotiables import NonNegotiables


class ReviewType(enum.Enum):
    Performance = "Performance"
    Progress = "Progress"

class ScheduledReview(Base):
    __tablename__ = "scheduled_review"

    id = Column(String(20), primary_key=True)
    type = Column(Enum(ReviewType))

    reviewer_id = Column(String(20), ForeignKey("teacher.id"))
    reviewing_id = Column(String(20), ForeignKey("teacher.id"))

    reviewer_event_id = Column(String(20), ForeignKey("event.id"))
    reviewing_event_id = Column(String(20), ForeignKey("event.id"))

    class_id = Column(String(20), ForeignKey("class.id"))
    result_id = Column(String(20), ForeignKey("review_result.id"))

    scheduled_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    
    # we have to specificly annotate the foreign keys
    # since it can be ambiguous to sqlalchemy as to 
    # which one to use
    reviewer = relationship("Teacher", foreign_keys=[reviewer_id])
    reviewed = relationship("Teacher", foreign_keys=[reviewing_id])

    reviewer_event = relationship("Event", foreign_keys=[reviewer_event_id])
    reviewed_event = relationship("Event", foreign_keys=[reviewing_event_id])

    cls = relationship("Class")
    result = relationship("ReviewResult")

class ReviewResult(Base):
    __tablename__ = "review_result"

    id = Column(String(20), primary_key=True)

    # TODO(10): wrong usage
    non_negotiables = Column(NonNegotiables)
    non_negotiables_evidence = Column(Text)

    student_progress_alignment_commentary = Column(Text)
    sen_provision_commentary = Column(Text)
    student_work_quality_commentary = Column(Text)
    exam_practice_commentary = Column(Text)

    scheduled_review = relationship("ScheduledReview")

