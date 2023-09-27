from sqlalchemy import Column, ForeignKey, String, Table
from ... import Base

ref = Table(
    "ref_teacher_to_department",
    Base.metadata,
    Column("department_id", String(20), ForeignKey("department.id"), primary_key=True),
    Column("teacher_id", String(20), ForeignKey("teacher.id"), primary_key=True)
)