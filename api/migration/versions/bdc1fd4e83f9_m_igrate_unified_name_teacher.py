"""m igrate unified name teacher

Revision ID: bdc1fd4e83f9
Revises: c030b2e0310c
Create Date: 2022-11-26 14:39:28.898434

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bdc1fd4e83f9'
down_revision = 'c030b2e0310c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'teacher',
        sa.Column('name', sa.String(256))
    )

    conn = op.get_bind()

    # combines first_name and last_name into
    # a single string, and sets the value into
    # the name field
    conn.execute(
        sa.text(
            """
            UPDATE teacher SET name = teacher.first_name || ' ' || teacher.last_name;
            """
        )
    )

    op.drop_column('teacher', 'first_name')
    op.drop_column('teacher', 'last_name')


def downgrade() -> None:
    op.add_column('teacher', sa.Column('first_name', sa.String(60)))
    op.add_column('teacher', sa.Column('last_name', sa.String(60)))

    conn = op.get_bind()
    
    # splits name into a first_name and last_name
    # allowing us to rollback the upgrade function
    # above
    conn.execute(
        sa.text(
            """
            UPDATE teacher SET first_name = SPLIT_PART(teacher.name, ' ', '1'), last_name = SPLIT_PART(teacher.name, ' ', '2');
            """
        )
    )

    op.drop_column('teacher', 'name')
