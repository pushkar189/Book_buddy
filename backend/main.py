import uuid

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Book
from .schemas import (
    BookCreate,
    BookListResponse,
    BookRead,
    BookStatus,
    BookUpdate,
    StatsResponse,
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_book_fields(*, status: BookStatus, progress: int, notes: str | None, rating: int | None):
    """
    Keep server-side logic consistent with what the UI expects:
    - completed => progress 100
    - wishlist => progress 0 and no notes/rating
    - reading => notes/rating cleared
    """
    if status == BookStatus.completed:
        return {
            "progress": 100,
            "notes": notes if isinstance(notes, str) else "",
            "rating": rating if isinstance(rating, int) else 0,
        }

    if status == BookStatus.wishlist:
        return {"progress": 0, "notes": None, "rating": None}

    # reading
    return {
        "progress": max(0, min(progress, 100)),
        "notes": None,
        "rating": None,
    }


app = FastAPI(title="Book Buddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/books", response_model=BookListResponse)
def list_books(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    # FastAPI will convert SQLAlchemy objects using `from_attributes`.
    return {"books": books}


@app.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    total = len(books)

    reading = sum(1 for b in books if b.status == BookStatus.reading.value)
    completed = sum(1 for b in books if b.status == BookStatus.completed.value)
    wishlist = sum(1 for b in books if b.status == BookStatus.wishlist.value)

    percent_completed = int(round((completed / total) * 100)) if total else 0

    in_progress = [b for b in books if b.status == BookStatus.reading.value]
    if in_progress:
        avg_reading_progress = int(
            round(sum(max(0, min(b.progress, 100)) for b in in_progress) / len(in_progress))
        )
    else:
        avg_reading_progress = 0

    books_by_genre: dict[str, int] = {}
    for b in books:
        g = (b.genre or "").strip()
        if not g:
            continue
        books_by_genre[g] = books_by_genre.get(g, 0) + 1

    return {
        "percent_completed": percent_completed,
        "reading": reading,
        "completed": completed,
        "wishlist": wishlist,
        "avg_reading_progress": avg_reading_progress,
        "books_by_genre": books_by_genre,
    }


@app.post("/books", response_model=BookRead, status_code=201)
def create_book(payload: BookCreate, db: Session = Depends(get_db)):
    status = payload.status

    normalized = normalize_book_fields(
        status=status,
        progress=payload.progress,
        notes=payload.notes,
        rating=payload.rating,
    )

    book = Book(
        id=str(uuid.uuid4()),
        title=payload.title.strip(),
        author=payload.author.strip(),
        genre=payload.genre.strip(),
        status=status.value,
        progress=normalized["progress"],
        notes=normalized["notes"],
        rating=normalized["rating"],
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.put("/books/{book_id}", response_model=BookRead)
def update_book(book_id: str, payload: BookUpdate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Merge updates.
    next_title = payload.title.strip() if payload.title is not None else book.title
    next_author = payload.author.strip() if payload.author is not None else book.author
    next_genre = payload.genre.strip() if payload.genre is not None else book.genre

    current_status = BookStatus(book.status)  # type: ignore[arg-type]
    next_status = payload.status or current_status

    next_progress = payload.progress if payload.progress is not None else book.progress
    next_notes = payload.notes if payload.notes is not None else book.notes
    next_rating = payload.rating if payload.rating is not None else book.rating

    normalized = normalize_book_fields(
        status=next_status,
        progress=next_progress,
        notes=next_notes,
        rating=next_rating,
    )

    book.title = next_title
    book.author = next_author
    book.genre = next_genre
    book.status = next_status.value
    book.progress = normalized["progress"]
    book.notes = normalized["notes"]
    book.rating = normalized["rating"]

    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    db.delete(book)
    db.commit()
    return None

