from sqlalchemy import Column, ForeignKey, String, Integer
from ... import Base, relationship

class AssocClassToStudent(Base):
    __tablename__ = "assoc_class_to_student"

    student_id = Column(String(20), ForeignKey("student.id"), primary_key=True)
    class_id = Column(String(20), ForeignKey("class.id"), primary_key=True)

    target_grade = Column(Integer, default=0, nullable=False)
    current_grade = Column(Integer, default=0, nullable=False)

    student = relationship("Student")
    cls = relationship("Class")

