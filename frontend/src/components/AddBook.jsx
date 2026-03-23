import { useMemo, useState } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function AddBook({ onAdd }) {
  const initialStatus = 'reading'

  const genreSuggestions = useMemo(
    () => ['Fiction', 'Non-fiction', 'Fantasy', 'Science', 'Biography', 'History'],
    []
  )

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const normalizedProgress = clamp(Number(progress) || 0, 0, 100)

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus)
    if (nextStatus === 'completed') setProgress(100)
    if (nextStatus === 'wishlist') setProgress(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const trimmedAuthor = author.trim()
    const trimmedGenre = genre.trim()

    if (!trimmedTitle) return setError('Title is required.')
    if (!trimmedAuthor) return setError('Author is required.')
    if (!trimmedGenre) return setError('Genre is required.')

    const next = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      author: trimmedAuthor,
      genre: trimmedGenre,
      status,
      progress:
        status === 'completed' ? 100 : status === 'wishlist' ? 0 : normalizedProgress,
      notes: status === 'completed' ? '' : undefined,
      rating: status === 'completed' ? 0 : undefined,
    }

    onAdd?.(next)

    setTitle('')
    setAuthor('')
    setGenre('')
    setStatus(initialStatus)
    setProgress(0)
  }

  return (
    <form className="bb-form" onSubmit={handleSubmit}>
      <div className="bb-field">
        <label>
          Title
          <input
            className="bb-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Hobbit"
            type="text"
          />
        </label>
      </div>

      <div className="bb-field">
        <label>
          Author
          <input
            className="bb-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g., J.R.R. Tolkien"
            type="text"
          />
        </label>
      </div>

      <div className="bb-field">
        <label>
          Genre
          <input
            className="bb-input"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g., Fantasy"
            list="bb-genre-suggestions"
            type="text"
          />
          <datalist id="bb-genre-suggestions">
            {genreSuggestions.map((g) => (
              <option value={g} key={g} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="bb-field">
        <label>
          Status
          <select
            className="bb-input"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
            <option value="wishlist">Wishlist</option>
          </select>
        </label>
      </div>

      <div className="bb-field bb-field--full">
        <label>
          Progress (%)
          <input
            className="bb-input"
            value={status === 'wishlist' ? 0 : status === 'completed' ? 100 : progress}
            disabled={status === 'wishlist' || status === 'completed'}
            onChange={(e) => setProgress(e.target.value)}
            min={0}
            max={100}
            step={1}
            type="number"
          />
        </label>
      </div>

      {error ? <div className="bb-error bb-field--full">{error}</div> : null}

      <button className="bb-button bb-field--full" type="submit">
        Add Book
      </button>
    </form>
  )
}

