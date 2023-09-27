"""add reason to watch request

Revision ID: b7c3d571ad0c
Revises: 4ba2e98c5510
Create Date: 2022-10-16 19:18:24.154910

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7c3d571ad0c'
down_revision = '4ba2e98c5510'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "watch_request",
        sa.Column("reason_type", sa.Integer, nullable=False)
    )

    op.add_column(
        "watch_request",
        sa.Column("reason_text", sa.Text, nullable=True)
    )


def downgrade() -> None:
    op.drop_column("watch_request", "reason_text")
    op.drop_column("watch_request", "reason_type")
