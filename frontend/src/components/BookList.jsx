import { useMemo } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function BookList({ books, onUpdate, onDelete }) {
  const sortedBooks = useMemo(() => {
    // Keep wishlist at the bottom by default.
    const order = { completed: 0, reading: 1, wishlist: 2 }
    return [...books].sort((a, b) => {
      const da = order[a.status] ?? 99
      const db = order[b.status] ?? 99
      if (da !== db) return da - db
      return a.title.localeCompare(b.title)
    })
  }, [books])

  if (!books?.length) {
    return <p className="bb-empty">No books yet. Add one above to get started.</p>
  }

  return (
    <div className="bb-list">
      {sortedBooks.map((book) => {
        const status = book.status ?? 'reading'
        const progress = status === 'wishlist' ? 0 : clamp(book.progress ?? 0, 0, 100)

        return (
          <article
            key={book.id}
            className="bb-card"
            aria-label={`Book: ${book.title}`}
          >
            <div className="bb-card-top">
              <div>
                <h3 className="bb-title">{book.title}</h3>
                <div className="bb-meta">
                  {book.author} • {book.genre}
                </div>
              </div>

              <button
                type="button"
                className="bb-delete"
                onClick={() => onDelete?.(book.id)}
              >
                Delete
              </button>
            </div>

            <div className="bb-row">
              <label className="bb-small-label">
                Status
                <select
                  className="bb-input"
                  value={status}
                  onChange={(e) => {
                    const nextStatus = e.target.value
                    const nextProgress =
                      nextStatus === 'completed' ? 100 : nextStatus === 'wishlist' ? 0 : progress
                    onUpdate?.(book.id, {
                      status: nextStatus,
                      progress: nextProgress,
                    })
                  }}
                >
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                  <option value="wishlist">Wishlist</option>
                </select>
              </label>
            </div>

            {status !== 'wishlist' ? (
              <div className="bb-progress">
                <div className="bb-progress-head">
                  <span className="bb-small-label">Progress</span>
                  <span className="bb-small-label">{progress}%</span>
                </div>

                <input
                  className="bb-range"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={progress}
                  onChange={(e) =>
                    onUpdate?.(book.id, { progress: Number(e.target.value) })
                  }
                />

                <input
                  className="bb-input"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={progress}
                  onChange={(e) =>
                    onUpdate?.(book.id, { progress: Number(e.target.value) })
                  }
                />
              </div>
            ) : (
              <p className="bb-muted">Wishlist item (add progress once you start reading).</p>
            )}

            {status === 'completed' ? (
              <div className="bb-notes">
                <div className="bb-field">
                  <label>
                    Personal notes
                    <textarea
                      className="bb-input bb-textarea"
                      value={book.notes ?? ''}
                      onChange={(e) => onUpdate?.(book.id, { notes: e.target.value })}
                      placeholder="Write what you thought about this book..."
                    />
                  </label>
                </div>

                <div className="bb-row">
                  <label className="bb-small-label">
                    Rating (1-5)
                    <select
                      className="bb-input"
                      value={typeof book.rating === 'number' && book.rating > 0 ? book.rating : ''}
                      onChange={(e) =>
                        onUpdate?.(book.id, {
                          rating: e.target.value ? Number(e.target.value) : 0,
                        })
                      }
                    >
                      <option value="">Not rated</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

