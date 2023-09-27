"""create notification

Revision ID: 48a706e8af82
Revises: 67d71cae83e5
Create Date: 2022-08-07 16:52:13.243579

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

from api.db.models import NotificationType


# revision identifiers, used by Alembic.
revision = '48a706e8af82'
down_revision = '67d71cae83e5'
branch_labels = None
depends_on = None

NOTIFICATION_TYPE_ENUM = postgresql.ENUM(NotificationType, name="notification_type")

def upgrade() -> None:
    op.create_table(
        "notification",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("dismissed", sa.Boolean, server_default="0"),
        sa.Column("type", NOTIFICATION_TYPE_ENUM),
        sa.Column("data", sa.JSON),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("notification")
    NOTIFICATION_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
