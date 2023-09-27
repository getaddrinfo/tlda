from enum import IntEnum as IntEnumImpl
from sqlalchemy import DateTime, Column, ForeignKey, Integer, String, Boolean, Text, Enum
from .. import Base, relationship
from .impl.IntEnum import IntEnum

class WatchRequestReasonType(IntEnumImpl):
    teaching_methods = 0
    behaviour_control = 1
    other = 2

class WatchRequest(Base):
    __tablename__ = "watch_request"

    id = Column(String(20), primary_key=True)
    time = Column(DateTime)
    length = Column(Integer)
    accepted = Column(Boolean)
    meta = Column(Text)

    reason_type = Column(IntEnum(WatchRequestReasonType))
    reason_text = Column(Text, nullable=True)

    
    target_id = Column(String(20), ForeignKey("teacher.id"))
    requester_id = Column(String(20), ForeignKey("teacher.id"))

    target = relationship("Teacher", foreign_keys=[target_id], back_populates="watch_requests_to_me")
    requester = relationship("Teacher", foreign_keys=[requester_id], back_populates="watch_requests_from_me")