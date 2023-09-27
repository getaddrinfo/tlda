"""add event ack

Revision ID: 9eaa5413a132
Revises: a81a8e761011
Create Date: 2022-09-29 13:34:01.403374

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9eaa5413a132'
down_revision = 'a81a8e761011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "event",
        sa.Column('ack', sa.Boolean, server_default='false')
    )


def downgrade() -> None:
    op.drop_column("event", "ack")
