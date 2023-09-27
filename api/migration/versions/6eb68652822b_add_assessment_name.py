"""add assessment name

Revision ID: 6eb68652822b
Revises: 30f37934de5c
Create Date: 2022-11-12 15:51:55.799297

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6eb68652822b'
down_revision = '30f37934de5c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("assessment", sa.Column("name", sa.Text, nullable=False))


def downgrade() -> None:
    op.drop_column("assessment", "name")
