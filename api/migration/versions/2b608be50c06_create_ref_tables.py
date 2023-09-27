"""create ref tables

Revision ID: 2b608be50c06
Revises: 8f6df5270364
Create Date: 2022-08-07 17:50:57.503794

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b608be50c06'
down_revision = '8f6df5270364'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ref_class_to_grading_system",
        sa.Column("class_id", sa.String(20), sa.ForeignKey("class.id"), primary_key=True),
        sa.Column("grading_system_id", sa.String(20), sa.ForeignKey("grading_system.id"), primary_key=True)
    )

    op.create_table(
        "ref_class_to_teacher",
        sa.Column("class_id", sa.String(20), sa.ForeignKey("class.id"), primary_key=True),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id"), primary_key=True)
    )

    op.create_table(
        "ref_class_to_student",
        sa.Column("class_id", sa.String(20), sa.ForeignKey("class.id"), primary_key=True),
        sa.Column("student_id", sa.String(20), sa.ForeignKey("student.id"), primary_key=True)
    )

    op.create_table(
        "ref_teacher_to_department",
        sa.Column("department_id", sa.String(20), sa.ForeignKey("department.id"), primary_key=True),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id"), primary_key=True)
    )


def downgrade() -> None:
    op.drop_table("ref_teacher_to_department")
    op.drop_table("ref_class_to_student")
    op.drop_table("ref_class_to_teacher")
    op.drop_table("ref_class_to_grading_system")
