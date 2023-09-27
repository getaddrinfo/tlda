"""add grading system name

Revision ID: 30f37934de5c
Revises: 3e6d2f03e020
Create Date: 2022-11-05 16:59:25.200856

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '30f37934de5c'
down_revision = '3e6d2f03e020'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("grading_system", sa.Column('name', sa.String(128), nullable=False, server_default='unset'))


def downgrade() -> None:
    op.drop_column("grading_system", 'name')
