from sqlalchemy import Column, ForeignKey, Integer, String
from .. import Base, relationship

class AssessmentScore(Base):
    __tablename__ = "assessment_score"

    id = Column(String(20), primary_key=True)
    mark = Column(Integer)
    flags = Column(Integer)

    assessment_id = Column(String(20), ForeignKey("assessment.id"), primary_key=True)
    marker_id = Column(String(20), ForeignKey("teacher.id"))
    student_id = Column(String(20), ForeignKey("student.id"))

    marker = relationship("Teacher")
    assessment = relationship("Assessment", back_populates="scores")
    student = relationship("Student", back_populates="scores")