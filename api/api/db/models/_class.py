from sqlalchemy import Column, ForeignKey, String, text, bindparam
from .. import Base, Session, relationship

from .ref import class_to_grading_system, class_to_teacher

# selects all the IDs of classes that a teacher
# can see by being a part of a department

# select distinct class ids where
# the teacher is a part of the 
# department

# TODO(8): bad query
SUBQUERY_TEACHER_IN_DEPARTMENT = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN ref_teacher_to_department AS ref_ttd
ON ref_ttd.teacher_id = :current_teacher_id
WHERE class.department_id = ref_ttd.department_id
"""

# selects all the IDs of classes that a teacher
# can see by being the lead of a department

# select distinct class ids where
# the department the class is associated 
# with is lead by the current teacher
SUBQUERY_TEACHER_IS_DEPARTMENT_LEAD = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN department AS d
ON d.lead_id = :current_teacher_id
WHERE class.department_id = d.id
"""

# selcts all the IDs of classes that a teacher
# can see by teaching a class

# select distinct class ids where
# the teacher teaches the class
SUBQUERY_TEACHER_TEACHES_CLASS = """
SELECT DISTINCT(class.id) FROM class
INNER JOIN ref_class_to_teacher AS ref_ctt
ON ref_ctt.teacher_id = :current_teacher_id
WHERE ref_ctt.class_id = class.id
"""

# all conditions joined to provide
# a determinant result
SELECT_JOINED = f"""
SELECT DISTINCT(class.id) FROM class
WHERE class.id IN ({ SUBQUERY_TEACHER_IN_DEPARTMENT }) OR class.id IN ({ SUBQUERY_TEACHER_IS_DEPARTMENT_LEAD }) OR class.id IN ({ SUBQUERY_TEACHER_TEACHES_CLASS })
"""

class Class(Base):
    __tablename__ = "class"

    id = Column(String(20), primary_key=True)
    code = Column(String)

    year_id = Column(String(20), ForeignKey("year.id"))
    department_id = Column(String(20), ForeignKey("department.id"))

    year = relationship("Year", back_populates="classes")
    assessments = relationship("Assessment", back_populates="cls")
    department = relationship("Department")

    grading_systems = relationship("GradingSystem", secondary=class_to_grading_system.ref)
    students = relationship("AssocClassToStudent", back_populates="cls")
    teachers = relationship("Teacher", secondary=class_to_teacher.ref)

    @staticmethod
    def visible(current_teacher_id):
        return Session.query(Class) \
            .filter(Class.id.in_(
                text(SELECT_JOINED) \
                    .bindparams(bindparam('current_teacher_id', current_teacher_id))
                )
            ) \
            .all()