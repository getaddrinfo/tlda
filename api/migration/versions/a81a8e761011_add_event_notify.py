"""add event notify


Revision ID: a81a8e761011
Revises: 2d544293d649
Create Date: 2022-09-25 15:17:21.160369

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a81a8e761011'
down_revision = '2d544293d649'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "event",
        sa.Column("notify", sa.Boolean, server_default='false')
    )


def downgrade() -> None:
    op.drop_column("event", "notify")
