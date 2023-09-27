from sqlalchemy import Column, ForeignKey, Table, String
from ... import Base

ref = Table(
    "ref_class_to_student",
    Base.metadata,
    Column("class_id", String(20), ForeignKey("class.id"), primary_key=True),
    Column("student_id", String(20), ForeignKey("student.id"), primary_key=True)
)