"""create auth

Revision ID: bc115093285a
Revises: cf619cb677f6
Create Date: 2022-08-09 16:53:47.030667

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'bc115093285a'
down_revision = 'cf619cb677f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "auth",
        sa.Column("token_hash", postgresql.BYTEA(32), primary_key=True),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column("expires_after", sa.Integer, server_default="86400")
    )


def downgrade() -> None:
    op.drop_table("auth")
