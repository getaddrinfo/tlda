"""create department

Revision ID: f2636ab1a6e8
Revises: 3a024933a471
Create Date: 2022-08-07 16:42:53.034794

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2636ab1a6e8'
down_revision = '3a024933a471'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "department",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("name", sa.String(32)),
        sa.Column("lead_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("department")
