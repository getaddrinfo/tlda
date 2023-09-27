"""add user email and password

Revision ID: cf619cb677f6
Revises: 2b608be50c06
Create Date: 2022-08-09 16:48:30.720815

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'cf619cb677f6'
down_revision = '2b608be50c06'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("teacher", sa.Column("email", sa.String(256)))
    op.add_column("teacher", sa.Column("password", postgresql.BYTEA(60)))

    op.create_unique_constraint("unique_teacher_email", "teacher", ["email"])


def downgrade() -> None:
    op.drop_constraint("unique_teacher_email", "teacher")
    op.drop_column("teacher", "password")
    op.drop_column("teacher", "email")
