"""add notification type

Revision ID: ee55a888e791
Revises: bc115093285a
Create Date: 2022-09-24 19:07:33.579182

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ee55a888e791'
down_revision = 'bc115093285a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE notification_type RENAME TO old_notification_type;")
    op.execute("CREATE TYPE notification_type AS ENUM ('important');")
    op.execute("ALTER TABLE notification ALTER COLUMN type TYPE notification_type USING type::text::notification_type;")
    op.execute("DROP TYPE old_notification_type;")


def downgrade() -> None:
    op.execute("ALTER TYPE notification_type RENAME TO old_notification_type;")
    op.execute("CREATE TYPE notification_type AS ENUM ();")
    op.execute("ALTER TABLE notification ALTER COLUMN type TYPE notification_type USING type::text::notification_type;")
    op.execute("DROP TYPE old_notification_type;")
