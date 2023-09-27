from sqlalchemy import Column, ForeignKey, Integer, String, Text
from .. import Base, relationship

class AssessmentComment(Base):
    __tablename__ = "assessment_comment"

    id = Column(String(20), primary_key=True)
    content = Column(Text)

    parent_id = Column(String(20), ForeignKey("assessment_comment.id"))
    author_id = Column(String(20), ForeignKey("teacher.id"))
    assessment_id = Column(String(20), ForeignKey("assessment.id"))

    author = relationship("Teacher")
    children = relationship("AssessmentComment")