import enum
from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects import postgresql
from .. import Base, relationship

class Auth(Base):
    __tablename__ = "auth"

    token_hash = Column(postgresql.BYTEA(32), primary_key=True)
    teacher_id = Column(String(20), ForeignKey("teacher.id"))
    created_at = Column(DateTime)
    expires_after = Column(Integer)

    # relationships
    teacher = relationship("Teacher", back_populates="sessions")
