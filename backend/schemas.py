from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class BookStatus(str, Enum):
    reading = "reading"
    completed = "completed"
    wishlist = "wishlist"


class BookBase(BaseModel):
    title: str = Field(..., max_length=200)
    author: str = Field(..., max_length=200)
    genre: str = Field(..., max_length=100)
    status: BookStatus = BookStatus.reading

    progress: int = Field(0, ge=0, le=100)
    notes: Optional[str] = None
    # Frontend uses 0 to mean "Not rated".
    rating: Optional[int] = Field(None, ge=0, le=5)


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=200)
    genre: Optional[str] = Field(None, max_length=100)
    status: Optional[BookStatus] = None

    progress: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    # Frontend uses 0 to mean "Not rated".
    rating: Optional[int] = Field(None, ge=0, le=5)


class BookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    author: str
    genre: str
    status: BookStatus
    progress: int
    notes: Optional[str] = None
    rating: Optional[int] = None


class BookListResponse(BaseModel):
    books: list[BookRead]


class StatsResponse(BaseModel):
    percent_completed: int
    reading: int
    completed: int
    wishlist: int
    avg_reading_progress: int
    books_by_genre: dict[str, int]

