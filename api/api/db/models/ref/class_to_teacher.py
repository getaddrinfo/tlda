from sqlalchemy import Column, ForeignKey, Table, String
from ... import Base

ref = Table(
    "ref_class_to_teacher",
    Base.metadata,
    Column("class_id", String(20), ForeignKey("class.id"), primary_key=True),
    Column("teacher_id", String(20), ForeignKey("teacher.id"), primary_key=True)
)