"""add event type

Revision ID: 2d544293d649
Revises: ee55a888e791
Create Date: 2022-09-24 19:40:09.703493

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d544293d649'
down_revision = 'ee55a888e791'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE event_type RENAME TO old_event_type;")
    op.execute("CREATE TYPE event_type AS ENUM ('PROGRESS_REVIEW', 'PERFORMANCE_REVIEW', 'WATCH');")
    op.execute("ALTER TABLE event ALTER COLUMN type TYPE event_type USING type::text::event_type;")
    op.execute("DROP TYPE old_event_type;")


def downgrade() -> None:
    op.execute("ALTER TYPE event_type RENAME TO old_event_type;")
    op.execute("CREATE TYPE event_type AS ENUM ();")
    op.execute("ALTER TABLE event ALTER COLUMN type TYPE event_type USING type::text::event_type;")
    op.execute("DROP TYPE old_event_type;")