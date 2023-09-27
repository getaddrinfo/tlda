"""create perf review

Revision ID: 768fa5f35eaa
Revises: 951bf251b2b3
Create Date: 2022-08-07 17:40:42.059608

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

from api.db.models import PerformanceReviewQualityType


# revision identifiers, used by Alembic.
revision = '768fa5f35eaa'
down_revision = '951bf251b2b3'
branch_labels = None
depends_on = None

REVIEW_QUALITY_TYPE_ENUM = postgresql.ENUM(
    PerformanceReviewQualityType,
    name="performance_review_quality_type"
)


def upgrade() -> None:
    op.create_table(
        "performance_review",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("overall", REVIEW_QUALITY_TYPE_ENUM),
        sa.Column("non_negotiables", sa.SmallInteger),
        sa.Column("student_work_quality", sa.SmallInteger),
        sa.Column("commentary", sa.Text),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column("assesser_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )

    op.create_check_constraint(
        "ck_performance_student_work_quality_less_than_or_equal_to_ten",
        "performance_review",
        sa.column("student_work_quality") <= 10
    )


def downgrade() -> None:
    op.drop_constraint("ck_performance_student_work_quality_less_than_or_equal_to_ten", "performance_review")
    op.drop_table("performance_review")

    REVIEW_QUALITY_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
