"""create teacher

Revision ID: 0f28d79ed9e5
Revises: 
Create Date: 2022-08-07 16:05:38.486599

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from api.db.models import TeacherRole


# revision identifiers, used by Alembic.
revision = '0f28d79ed9e5'
down_revision = None
branch_labels = None
depends_on = None

# Derived from:
# https://stackoverflow.com/questions/47206201/how-to-use-enum-with-sqlalchemy-and-alembic
TEACHER_ROLE_ENUM = postgresql.ENUM(TeacherRole, name="teacher_role")

def upgrade() -> None:
    op.create_table(
        "teacher",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("first_name", sa.String(60), nullable=False),
        sa.Column("last_name", sa.String(60), nullable=False),
        sa.Column("preferred_name", sa.String(60)),
        sa.Column("role", TEACHER_ROLE_ENUM, nullable=False, server_default=TeacherRole.TEACHER.value)
    )

    op.create_unique_constraint(
        "idx_unique_teacher_full_name",
        "teacher",
        ["first_name", "last_name"]
    )


def downgrade() -> None:
    op.drop_constraint("idx_unique_teacher_full_name", "teacher")
    op.drop_table("teacher")

    # Ensure the enum is definitely dropped
    TEACHER_ROLE_ENUM.drop(op.get_bind(), checkfirst=True)
