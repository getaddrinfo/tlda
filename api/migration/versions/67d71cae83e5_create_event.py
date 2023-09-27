"""create event

Revision ID: 67d71cae83e5
Revises: 97dddd9d5039
Create Date: 2022-08-07 16:49:30.939962

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

from api.db.models.event import EventType

# revision identifiers, used by Alembic.
revision = '67d71cae83e5'
down_revision = '97dddd9d5039'
branch_labels = None
depends_on = None

EVENT_TYPE_ENUM = postgresql.ENUM(EventType, name="event_type")

def upgrade() -> None:
    op.create_table(
        "event",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("type", EVENT_TYPE_ENUM),
        sa.Column("data", sa.JSON),
        sa.Column("scheduled_at", sa.DateTime),
        sa.Column("teacher_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("event")
    EVENT_TYPE_ENUM.drop(op.get_bind(), checkfirst=True)
