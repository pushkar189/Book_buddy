from sqlalchemy import Column, Integer, String, Text

from .database import Base


class Book(Base):
    __tablename__ = "books"

    # Store as UUID string so SQLite can handle it easily.
    id = Column(String(36), primary_key=True)

    title = Column(String(200), nullable=False)
    author = Column(String(200), nullable=False)
    genre = Column(String(100), nullable=False)

    # reading | completed | wishlist
    status = Column(String(20), nullable=False, default="reading")
    progress = Column(Integer, nullable=False, default=0)

    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)

