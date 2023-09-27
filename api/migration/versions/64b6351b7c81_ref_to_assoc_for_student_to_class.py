"""ref to assoc for student to class


Revision ID: 64b6351b7c81
Revises: 9eaa5413a132
Create Date: 2022-10-01 15:01:23.561302

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '64b6351b7c81'
down_revision = '9eaa5413a132'
branch_labels = None
depends_on = None

OLD_TABLE_NAME = "ref_class_to_student"
NEW_TABLE_NAME = "assoc_class_to_student"

# neat way of not losing current data
def upgrade() -> None:
    op.add_column(
        OLD_TABLE_NAME,
        sa.Column("target_grade", sa.Integer, nullable=False)
    )

    op.add_column(
        OLD_TABLE_NAME,
        sa.Column("current_grade", sa.Integer, nullable=False)
    )

    op.rename_table(
        OLD_TABLE_NAME,
        NEW_TABLE_NAME
    )

# neat way of not losing current data
# apart from student grades
def downgrade() -> None:
    op.rename_table(NEW_TABLE_NAME, OLD_TABLE_NAME)
    op.drop_column(OLD_TABLE_NAME, "current_grade")
    op.drop_column(OLD_TABLE_NAME, "target_grade")


