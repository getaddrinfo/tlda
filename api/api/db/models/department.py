from sqlalchemy import Column, ForeignKey, Integer, String
from .. import Base, relationship

from .ref import teacher_to_department

class Department(Base):
    __tablename__ = "department"

    id = Column(String(20), primary_key=True)
    name = Column(String(32))
    lead_id = Column(String(20), ForeignKey("teacher.id"))

    lead = relationship("Teacher", back_populates="departments_i_lead")
    assessments = relationship("Assessment", back_populates="department")
    classes = relationship("Class", back_populates="department")
    teachers = relationship("Teacher", secondary=teacher_to_department.ref)