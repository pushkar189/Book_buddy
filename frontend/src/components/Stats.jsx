const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function Stats({ books }) {
  const total = books?.length ?? 0
  const readingCount = (books ?? []).filter((b) => b.status === 'reading').length
  const completedCount = (books ?? []).filter((b) => b.status === 'completed').length
  const wishlistCount = (books ?? []).filter((b) => b.status === 'wishlist').length

  const percentCompleted = total
    ? Math.round((completedCount / total) * 100)
    : 0

  const genreCounts = (books ?? []).reduce((acc, b) => {
    const g = (b.genre ?? '').trim()
    if (!g) return acc
    acc[g] = (acc[g] ?? 0) + 1
    return acc
  }, {})

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Optional: average progress for in-progress books.
  const inProgress = (books ?? []).filter((b) => b.status === 'reading' || b.status === undefined)
  const avgReadingProgress = inProgress.length
    ? Math.round(
        inProgress.reduce((sum, b) => sum + clamp(b.progress ?? 0, 0, 100), 0) / inProgress.length
      )
    : 0

  if (!total) {
    return (
      <div className="bb-stats">
        <p className="bb-empty">Add a book to see your stats.</p>
      </div>
    )
  }

  return (
    <div className="bb-stats">
      <div className="bb-stats-row">
        <div className="bb-badge">
          Completed: <strong>{percentCompleted}%</strong>
        </div>
        <div className="bb-badge">
          Reading: <strong>{readingCount}</strong>
        </div>
        <div className="bb-badge">
          Completed: <strong>{completedCount}</strong>
        </div>
        <div className="bb-badge">
          Wishlist: <strong>{wishlistCount}</strong>
        </div>
        <div className="bb-badge">
          Avg reading progress: <strong>{avgReadingProgress}%</strong>
        </div>
      </div>

      <div className="bb-genre">
        <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Books by Genre</h3>
        <div className="bb-genre-list">
          {topGenres.length ? (
            topGenres.map(([genre, count]) => (
              <span className="bb-genre-item" key={genre}>
                {genre} ({count})
              </span>
            ))
          ) : (
            <span className="bb-muted">No genre data yet.</span>
          )}
        </div>
      </div>
    </div>
  )
}

