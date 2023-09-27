"""add meta to watch request


Revision ID: 4ba2e98c5510
Revises: 64b6351b7c81
Create Date: 2022-10-16 19:14:51.065669

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4ba2e98c5510'
down_revision = '64b6351b7c81'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "watch_request",
        sa.Column("meta", sa.Text)
    )


def downgrade() -> None:
    op.drop_column("watch_request", "meta")
