"""add performance review result

Revision ID: fcc5ee017109
Revises: 26c490cd4a21
Create Date: 2022-10-18 17:55:24.037459

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fcc5ee017109'
down_revision = '26c490cd4a21'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("review_result",
        sa.Column("id", sa.String(20), primary_key=True),
        
        # non-negotiables
        sa.Column("non_negotiables", sa.ARRAY(sa.Boolean)),
        sa.Column("non_negotiables_evidence", sa.Text),

        # goal alignment
        sa.Column("student_progress_alignment_commentary", sa.Text),
        
        # sen provision
        sa.Column("sen_provision_commentary", sa.Text),

        # student work quality commentary
        sa.Column("student_work_quality_commentary", sa.Text),

        # exam practice commentary (ks4/5 only)
        sa.Column("exam_practice_commentary", sa.Text, nullable=True)
    )

    op.add_column("scheduled_review", 
        sa.Column("result_id", sa.String(20), sa.ForeignKey("review_result.id"), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("scheduled_review", "result_id")
    op.drop_table("review_result")