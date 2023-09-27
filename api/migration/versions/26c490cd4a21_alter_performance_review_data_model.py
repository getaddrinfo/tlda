"""alter performance review data model

Revision ID: 26c490cd4a21
Revises: b7c3d571ad0c
Create Date: 2022-10-18 17:51:49.167924

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql

from api.db.models.scheduled_review import ReviewType


# revision identifiers, used by Alembic.
revision = '26c490cd4a21'
down_revision = 'b7c3d571ad0c'
branch_labels = None
depends_on = None

REVIEW_TYPE = postgresql.ENUM(ReviewType, name="review_type")

def upgrade() -> None:
    op.create_table("scheduled_review", 
        sa.Column("id", sa.String(20), primary_key=True),
        sa.Column("type", REVIEW_TYPE),

        # teachers
        sa.Column("reviewer_id", sa.String(20), sa.ForeignKey("teacher.id")),
        sa.Column("reviewing_id", sa.String(20), sa.ForeignKey("teacher.id")),

        # events
        sa.Column("reviewer_event_id", sa.String(20), sa.ForeignKey("event.id"),),
        sa.Column("reviewing_event_id", sa.String(20), sa.ForeignKey("event.id")),

        # class
        sa.Column("class_id", sa.String(20), sa.ForeignKey("class.id"))
    )


def downgrade() -> None:
    op.drop_table("scheduled_review")
    REVIEW_TYPE.drop(op.get_bind(), checkfirst=True)