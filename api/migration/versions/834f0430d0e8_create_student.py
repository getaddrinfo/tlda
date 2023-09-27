"""create student

Revision ID: 834f0430d0e8
Revises: 0f28d79ed9e5
Create Date: 2022-08-07 16:26:52.007870

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from api.db.models import StudentGender


# revision identifiers, used by Alembic.
revision = '834f0430d0e8'
down_revision = '0f28d79ed9e5'
branch_labels = None
depends_on = None

STUDENT_GENDER_ENUM = postgresql.ENUM(StudentGender, name="student_gender")

def upgrade() -> None:
    op.create_table(
        "student",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("candidate_id", sa.Integer),
        sa.Column("first_name", sa.String(60), nullable=False),
        sa.Column("last_name", sa.String(60), nullable=False),
        sa.Column("flags", sa.Integer, nullable=False, server_default='0'),
        sa.Column("sen_flags", sa.Integer, nullable=False, server_default='0'),
        sa.Column("gender", STUDENT_GENDER_ENUM, nullable=False),
        sa.Column("year_id", sa.String(20), nullable=False)
    )


def downgrade() -> None:
    op.drop_table("student")
    STUDENT_GENDER_ENUM.drop(op.get_bind(), checkfirst=True)
