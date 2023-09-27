"""create assessment score

Revision ID: d909e63cc98a
Revises: 48a79d70f0ce
Create Date: 2022-08-07 17:30:38.951589

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd909e63cc98a'
down_revision = '48a79d70f0ce'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assessment_score",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("mark", sa.Integer),
        sa.Column("flags", sa.Integer),

        sa.Column("assessment_id", sa.String(20), sa.ForeignKey("assessment.id")),
        sa.Column("marker_id", sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column("student_id", sa.String(20), sa.ForeignKey("student.id"))
    )

    op.create_unique_constraint(
        "idx_unique_assessment_score_assessment_student",
        "assessment_score",
        ["assessment_id", "student_id"]
    )


def downgrade() -> None:
    op.drop_constraint("idx_unique_assessment_score_assessment_student", "assessment_score")
    op.drop_table("assessment_score")
