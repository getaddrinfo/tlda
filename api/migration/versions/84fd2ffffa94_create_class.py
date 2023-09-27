"""create class

Revision ID: 84fd2ffffa94
Revises: f2636ab1a6e8
Create Date: 2022-08-07 16:44:29.820492

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '84fd2ffffa94'
down_revision = 'f2636ab1a6e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "class",
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("code", sa.String(10)),
        sa.Column("year_id", sa.String(20), sa.ForeignKey("year.id")),
        sa.Column("department_id", sa.String(20), sa.ForeignKey("department.id"))
    )


def downgrade() -> None:
    op.drop_table("class")
