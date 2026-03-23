import { useEffect, useMemo, useState } from 'react'
import AddBook from './components/AddBook.jsx'
import BookList from './components/BookList.jsx'
import Stats from './components/Stats.jsx'
import './App.css'

const STORAGE_KEY = 'bookbuddy.books.v1'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function normalizeBook(book) {
  const status = book?.status ?? 'reading'
  const progressRaw = Number(book?.progress ?? 0)
  const progress =
    status === 'completed' ? 100 : status === 'wishlist' ? 0 : clamp(progressRaw, 0, 100)

  const next = {
    id: book?.id ?? crypto.randomUUID(),
    title: String(book?.title ?? '').trim(),
    author: String(book?.author ?? '').trim(),
    genre: String(book?.genre ?? '').trim(),
    status,
    progress,
  }

  if (status === 'completed') {
    next.notes = typeof book?.notes === 'string' ? book.notes : ''
    next.rating = typeof book?.rating === 'number' ? book.rating : 0
  }

  return next
}

function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeBook).filter((b) => b.title && b.author && b.genre)
  } catch {
    return []
  }
}

export default function App() {
  const [books, setBooks] = useState(() => loadBooks())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  }, [books])

  const statsBooks = useMemo(() => books, [books])

  const addBook = (nextBook) => {
    const normalized = normalizeBook(nextBook)
    if (!normalized.title || !normalized.author || !normalized.genre) return
    setBooks((prev) => [...prev, normalized])
  }

  const updateBook = (id, updates) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b

        const merged = { ...b, ...updates }
        const status = merged.status ?? b.status
        merged.status = status

        if (status === 'completed') {
          merged.progress = 100
          merged.notes = typeof merged.notes === 'string' ? merged.notes : ''
          merged.rating =
            typeof merged.rating === 'number' && merged.rating >= 1 && merged.rating <= 5
              ? merged.rating
              : 0
        }

        if (status === 'wishlist') {
          merged.progress = 0
          merged.notes = undefined
          merged.rating = undefined
        }

        if (status === 'reading') {
          merged.progress = clamp(Number(merged.progress ?? b.progress), 0, 99)
          merged.notes = undefined
          merged.rating = undefined
        }

        if (status !== 'completed' && status !== 'wishlist' && status !== 'reading') {
          merged.progress = clamp(Number(merged.progress ?? b.progress), 0, 100)
        }

        return normalizeBook(merged)
      })
    )
  }

  const deleteBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="bb-app">
      <header className="bb-header">
        <h1 className="bb-title-main">Book Buddy</h1>
        <p className="bb-subtitle">Track your reading progress, notes, and ratings.</p>
      </header>

      <main className="bb-main">
        <section className="bb-panel">
          <h2 className="bb-section-title">Add a book</h2>
          <AddBook onAdd={addBook} />
        </section>

        <section className="bb-panel">
          <h2 className="bb-section-title">Reading stats</h2>
          <Stats books={statsBooks} />
        </section>

        <section className="bb-panel bb-panel--books">
          <h2 className="bb-section-title">Your books</h2>
          <BookList books={books} onUpdate={updateBook} onDelete={deleteBook} />
        </section>
      </main>
    </div>
  )
}
