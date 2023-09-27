"""migrate unified name student

Revision ID: c297504277c0
Revises: bdc1fd4e83f9
Create Date: 2022-11-26 14:47:04.562419

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c297504277c0'
down_revision = 'bdc1fd4e83f9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'student',
        sa.Column('name', sa.String(256))
    )

    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            UPDATE student SET name = student.first_name || ' ' || student.last_name;
            """
        )
    )

    op.drop_column('student', 'first_name')
    op.drop_column('student', 'last_name')


def downgrade() -> None:
    op.add_column('student', sa.Column('first_name', sa.String(60)))
    op.add_column('student', sa.Column('last_name', sa.String(60)))

    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            UPDATE student SET first_name = SPLIT_PART(student.name, ' ', '1'), last_name = SPLIT_PART(student.name, ' ', '2');
            """
        )
    )

    op.drop_column('student', 'name')
