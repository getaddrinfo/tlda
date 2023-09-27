from sqlalchemy import Column, ForeignKey, Table, String
from ... import Base

ref = Table(
    "ref_class_to_grading_system",
    Base.metadata,
    Column("class_id", String(20), ForeignKey("class.id"), primary_key=True),
    Column("grading_system_id", String(20), ForeignKey("grading_system.id"), primary_key=True)
)