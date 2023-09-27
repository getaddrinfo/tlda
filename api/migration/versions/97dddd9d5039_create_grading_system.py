"""create grading system

Revision ID: 97dddd9d5039
Revises: 84fd2ffffa94
Create Date: 2022-08-07 16:46:09.843555

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '97dddd9d5039'
down_revision = '84fd2ffffa94'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "grading_system",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("public", sa.Boolean),
        sa.Column("grades", postgresql.ARRAY(sa.String)),
        sa.Column("author_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("grading_system")
