import enum
from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from .. import Base, relationship

from .ref import class_to_student

class StudentGender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Student(Base):
    __tablename__ = "student"

    id = Column(String(20), primary_key=True)
    candidate_id = Column(Integer)
    name = Column(String(256))

    flags = Column(Integer)
    sen_flags = Column(Integer)
    gender = Column(Enum(StudentGender))

    year_id = Column(String(20), ForeignKey("year.id"))

    year = relationship("Year", back_populates="students")
    scores = relationship("AssessmentScore", back_populates="student")
    classes = relationship("AssocClassToStudent", back_populates="student")

    
    