"""create watch request

Revision ID: 951bf251b2b3
Revises: d909e63cc98a
Create Date: 2022-08-07 17:38:56.585424

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '951bf251b2b3'
down_revision = 'd909e63cc98a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "watch_request",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("time", sa.DateTime),
        sa.Column("length", sa.Integer),
        sa.Column("accepted", sa.Boolean, server_default="false"),
        sa.Column("target_id", sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column("requester_id", sa.String(20), sa.ForeignKey("teacher.id"))
    )


def downgrade() -> None:
    op.drop_table("watch_request")
