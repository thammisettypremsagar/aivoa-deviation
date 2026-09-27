from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True)

    site = Column(String(255))
    date = Column(String(100))
    title = Column(String(500))
    source = Column(String(255))
    product = Column(String(255))
    batch = Column(String(255))

    description = Column(Text)
    impact = Column(Text)
    severity = Column(String(50))
    severity_reason = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )