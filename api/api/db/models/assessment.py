import enum
from sqlalchemy import ARRAY, Column, Enum, ForeignKey, Integer, String, bindparam, text, Text

from api.db.models.student import Student
from .. import Base, Session, relationship

# fixed assoc_class_to_student
FULL_QUERY = """
SELECT DISTINCT(assoc.student_id) FROM assoc_class_to_student as assoc
INNER JOIN class ON class.id = assoc.class_id
WHERE class.year_id = :year_id AND class.department_id = :department_id
"""

class AssessmentType(enum.Enum):
    CLASS = "class"
    YEAR = "year"

class Assessment(Base):
    __tablename__ = "assessment"

    id = Column(String(20), primary_key=True)
    name = Column(Text)
    type = Column(Enum(AssessmentType))
    max_marks = Column(Integer)
    grade_boundaries = Column(ARRAY(Integer))
    flags = Column(Integer)

    # For type YEAR, both must be set:
    # An assessment cannot belong to a year
    # but no department, and vice versa.
    year_id = Column(String(20), ForeignKey("year.id"))
    department_id = Column(String(20), ForeignKey("department.id"))

    # For type CLASS, this field must be set
    class_id = Column(String(20), ForeignKey("class.id"))

    # TODO(9): cannot be null
    grading_system_id = Column(String(20), ForeignKey("grading_system.id"))

    scores = relationship("AssessmentScore", back_populates="assessment")
    year = relationship("Year", back_populates="assessments")
    department = relationship("Department", back_populates="assessments")
    grading_system = relationship("GradingSystem")
    cls = relationship("Class", back_populates="assessments")

    def get_students(self):
        return list(map(lambda x: x.student, self.cls.students)) if self.type == AssessmentType.CLASS else self.get_students_for_department(
            self.year_id,
            self.department_id
        )

    @staticmethod
    def get_students_for_department(year_id, dep_id):
        return Session.query(Student) \
            .filter(Student.id.in_(
                text(FULL_QUERY) \
                    .bindparams(bindparam('year_id', year_id), bindparam('department_id', dep_id))
            )) \
            .all()

        