from sqlalchemy import Column, ForeignKey, Integer, String
from .. import Base, relationship

class Year(Base):
    __tablename__ = "year"

    id = Column(String(20), primary_key=True)
    final_year = Column(Integer)
    head_of_year_id = Column(String(20), ForeignKey("teacher.id"))

    head_of_year = relationship("Teacher", back_populates="years_i_lead")
    classes = relationship("Class", back_populates="year")
    assessments = relationship("Assessment", back_populates="year")
    students = relationship("Student", back_populates="year")
