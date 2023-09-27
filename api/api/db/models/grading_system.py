from sqlalchemy import ARRAY, Boolean, Column, ForeignKey, String
from .. import Base, relationship
from .ref import class_to_grading_system

class GradingSystem(Base):
    __tablename__ = "grading_system"

    id = Column(String(20), primary_key=True)
    name = Column(String(128))
    public = Column(Boolean)
    grades = Column(ARRAY(String))
    author_id = Column(String(20), ForeignKey("teacher.id"))

    classes = relationship("Class", secondary=class_to_grading_system.ref)
    teacher = relationship("Teacher")

