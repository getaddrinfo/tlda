"""create assessment

Revision ID: 48a79d70f0ce
Revises: 48a706e8af82
Create Date: 2022-08-07 16:59:20.133196

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

from api.db.models.assessment import AssessmentType

from sqlalchemy import column, func

# revision identifiers, used by Alembic.
revision = '48a79d70f0ce'
down_revision = '48a706e8af82'
branch_labels = None
depends_on = None

ASSESSMENT_TYPE_ENUM = postgresql.ENUM(
    AssessmentType,
    name="assessment_type"
)

CHECK_IS_CLASS = "{table}.class_id IS NOT NULL AND {table}.year_id IS NULL AND {table}.department_id IS NULL".format(table="assessment")
CHECK_IS_YEAR = "{table}.class_id IS NULL and {table}.year_id IS NOT NULL AND {table}.department_id IS NOT NULL".format(table="assessment")

def upgrade() -> None:
    op.create_table(
        "assessment",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("type", ASSESSMENT_TYPE_ENUM),
        sa.Column("max_marks", sa.Integer),
        sa.Column("grade_boundaries", postgresql.ARRAY(sa.Integer)),
        sa.Column("flags", sa.Integer),
        sa.Column("grading_system_id", sa.String(20), sa.ForeignKey("grading_system.id")),

        # For type YEAR
        sa.Column("year_id", sa.String(20), sa.ForeignKey("year.id"), nullable=True),
        sa.Column("department_id", sa.String(20), sa.ForeignKey("department.id"), nullable=True),

        # For type CLASS
        sa.Column("class_id", sa.String(20), sa.ForeignKey("class.id"), nullable=True)
    )

    op.create_check_constraint(
        "ck_assessment_type_correct_id_set",
        "assessment",
        """
        CASE {table}.type WHEN '{type_class}' THEN {class_check}
                  WHEN '{type_year}' THEN {year_check}
                  ELSE {fallback}
        END
        """.format(
            type_class=AssessmentType.CLASS.name,
            class_check=CHECK_IS_CLASS,

            type_year=AssessmentType.YEAR.name,
            year_check=CHECK_IS_YEAR,

            table="assessment",
            fallback="false"
        )
    )


def downgrade() -> None:
    op.drop_constraint("ck_assessment_type_correct_id_set", "assessment")
    op.drop_table("assessment")

    ASSESSMENT_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
