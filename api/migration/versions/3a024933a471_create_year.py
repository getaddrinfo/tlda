"""create year

Revision ID: 3a024933a471
Revises: 834f0430d0e8
Create Date: 2022-08-07 16:36:16.783772

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a024933a471'
down_revision = '834f0430d0e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "year",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("final_year", sa.Integer, nullable=False),
        sa.Column("head_of_year_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("year")
