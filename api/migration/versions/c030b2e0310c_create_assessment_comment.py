"""create assessment comment

Revision ID: c030b2e0310c
Revises: 6eb68652822b
Create Date: 2022-11-12 19:55:53.691316

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c030b2e0310c'
down_revision = '6eb68652822b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("assessment_comment",
        sa.Column('id', sa.String(20), primary_key=True),
        sa.Column('content', sa.Text),
        sa.Column('author_id', sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column('assessment_id', sa.String(20), sa.ForeignKey("assessment.id"))
    )

    op.add_column("assessment_comment", sa.Column('parent_id', sa.String(20), sa.ForeignKey("assessment_comment.id")))


def downgrade() -> None:
    op.drop_column("assessment_comment", "parent_id")
    op.drop_table("assessment_comment")
