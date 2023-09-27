"""alter scheduled review

Revision ID: 3e6d2f03e020
Revises: fcc5ee017109
Create Date: 2022-10-19 10:23:54.255645

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3e6d2f03e020'
down_revision = 'fcc5ee017109'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("scheduled_review",
        sa.Column("scheduled_at", sa.DateTime)
    )

    op.add_column("scheduled_review",
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp())
    )


def downgrade() -> None:
    op.drop_column("scheduled_review", "created_at")
    op.drop_column("scheduled_review", "scheduled_at")