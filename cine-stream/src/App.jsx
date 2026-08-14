import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_POSTER = 'https://placehold.co/500x750/111827/94a3b8?text=No+Poster'

const FALLBACK_MOVIES = [
  { id: 1, title: 'Inception', release_date: '2010-07-16', vote_average: 8.4, poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', overview: 'A thief enters dreams to plant an idea in a target.' },
  { id: 2, title: 'Interstellar', release_date: '2014-11-07', vote_average: 8.7, poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', overview: 'A team of explorers travel through a wormhole in search of a new home.' },
  { id: 3, title: 'Parasite', release_date: '2019-05-30', vote_average: 8.5, poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', overview: 'A poor family schemes to infiltrate a wealthy household.' },
  { id: 4, title: 'Dune', release_date: '2021-10-22', vote_average: 8.0, poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', overview: 'A noble house seizes control of a vital desert planet.' },
  { id: 5, title: 'The Batman', release_date: '2022-03-04', vote_average: 7.9, poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', overview: 'Batman investigates crimes while a city spirals into chaos.' },
  { id: 6, title: 'Spirited Away', release_date: '2001-07-20', vote_average: 8.5, poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', overview: 'A girl enters a magical bathhouse and must find her way home.' },
  { id: 7, title: 'Arrival', release_date: '2016-11-11', vote_average: 7.9, poster_path: '/h2mhj0Q4Gd2V6ZskCPrR0z7a3L4.jpg', overview: 'A linguist deciphers alien language to protect humanity.' },
  { id: 8, title: 'Mad Max: Fury Road', release_date: '2015-05-15', vote_average: 7.8, poster_path: '/8tZYJkQJgXVC6sVY8n6gVME86Fe.jpg', overview: 'A lone drifter and a fugitive warrior cross the desert.' },
  { id: 9, title: 'The Dark Knight', release_date: '2008-07-18', vote_average: 9.0, poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', overview: 'Batman faces the Joker in a city in turmoil.' },
  { id: 10, title: 'Whiplash', release_date: '2014-10-10', vote_average: 8.5, poster_path: '/lIv1QinFqz4dlp5U4lQ6HaiskOZ.jpg', overview: 'An ambitious jazz drummer battles a ruthless instructor.' },
  { id: 11, title: 'The Social Network', release_date: '2010-10-01', vote_average: 7.8, poster_path: '/n0ybibhJtQ5icDqTp8eRytcY8Rj.jpg', overview: 'The founding of Facebook is explored through legal disputes and ambition.' },
  { id: 12, title: 'La La Land', release_date: '2016-12-09', vote_average: 8.0, poster_path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', overview: 'A jazz pianist and aspiring actress chase their dreams in Los Angeles.' }
]

const FALLBACK_MOOD_MAP = {
  sad: 'The Pursuit of Happyness',
  happy: 'Paddington 2',
  action: 'Mad Max: Fury Road',
  comedy: 'The Grand Budapest Hotel',
  romance: 'La La Land',
  thriller: 'Parasite',
  dramatic: 'Arrival',
  adventure: 'Interstellar',
  dark: 'The Batman',
  relaxed: 'Spirited Away',
}

const readFavorites = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = window.localStorage.getItem('cine-stream-favorites')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const normalizeMovie = (movie) => ({
  id: movie.id,
  title: movie.title || movie.name || 'Untitled',
  releaseDate: movie.release_date || movie.first_air_date || 'N/A',
  year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
  rating: movie.vote_average ? Number(movie.vote_average).toFixed(1) : 'NR',
  poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster || FALLBACK_POSTER,
  overview: movie.overview || 'No synopsis available yet.',
})

const getFallbackMovies = (query = '') => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return FALLBACK_MOVIES
  }

  return FALLBACK_MOVIES.filter((movie) => {
    const title = movie.title.toLowerCase()
    const overview = (movie.overview || '').toLowerCase()
    return title.includes(normalizedQuery) || overview.includes(normalizedQuery)
  })
}

const suggestMovieFromMood = (prompt) => {
  const normalizedPrompt = prompt.toLowerCase()

  for (const [keyword, title] of Object.entries(FALLBACK_MOOD_MAP)) {
    if (normalizedPrompt.includes(keyword)) {
      return title
    }
  }

  return 'Inception'
}

const fetchMoodTitle = async (prompt) => {
  const openAiKey = import.meta.env.VITE_OPENAI_KEY
  const geminiKey = import.meta.env.VITE_GEMINI_KEY

  if (openAiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Suggest ONE movie title based on this mood: "${prompt}". Return ONLY the movie title as plain text with no quotes or explanation.`,
          },
        ],
        temperature: 0.3,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const title = data.choices?.[0]?.message?.content?.trim()
      if (title) return title.replace(/^"|"$/g, '')
    }
  }

  if (geminiKey) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Suggest ONE movie title based on this mood: "${prompt}". Return ONLY the movie title as plain text with no quotes or explanation.` }],
          }],
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (title) return title.replace(/^"|"$/g, '')
    }
  }

  return suggestMovieFromMood(prompt)
}

function App() {
  const [favorites, setFavorites] = useState(readFavorites)
  const [movies, setMovies] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [moodInput, setMoodInput] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef(null)

  const favoriteIds = useMemo(() => new Set(favorites.map((movie) => movie.id)), [favorites])

  const fetchMovies = async (requestedPage = 1, query = '', append = false) => {
    setIsLoading(true)
    setError('')

    try {
      const apiKey = import.meta.env.VITE_TMDB_KEY

      if (!apiKey) {
        const fallbackResults = getFallbackMovies(query).map(normalizeMovie)
        const slice = fallbackResults.slice((requestedPage - 1) * 8, requestedPage * 8)

        setMovies((previousMovies) => {
          if (append) return [...previousMovies, ...slice]
          return slice
        })
        setHasMore(requestedPage < 2)
        return
      }

      const endpoint = query
        ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${requestedPage}&include_adult=false`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${requestedPage}`

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Movie fetch failed')
      }

      const data = await response.json()
      const results = (data.results || []).map(normalizeMovie)

      setMovies((previousMovies) => {
        if (append) return [...previousMovies, ...results]
        return results
      })
      setHasMore(requestedPage < data.total_pages)
    } catch {
      setError('Unable to load the movie feed right now. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
    fetchMovies(1, debouncedQuery, false)
  }, [debouncedQuery])

  useEffect(() => {
    window.localStorage.setItem('cine-stream-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const sentinel = observerRef.current

    if (!sentinel || !hasMore) {
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchMovies(nextPage, debouncedQuery, true)
      }
    }, { rootMargin: '200px' })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [debouncedQuery, hasMore, page])

  const handleToggleFavorite = (movie) => {
    setFavorites((previousFavorites) => {
      const exists = previousFavorites.some((item) => item.id === movie.id)
      if (exists) {
        return previousFavorites.filter((item) => item.id !== movie.id)
      }

      return [movie, ...previousFavorites]
    })
  }

  const handleMoodSubmit = async (event) => {
    event.preventDefault()

    const trimmedMood = moodInput.trim()
    if (!trimmedMood) return

    const matchTitle = await fetchMoodTitle(trimmedMood)
    setSearchInput(matchTitle)
    setMoodInput('')
    setDebouncedQuery(matchTitle)
  }

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchMovies(nextPage, debouncedQuery, true)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <span className="brand-mark">C</span>
            <div>
              <p className="brand-tag">Cine-Stream</p>
              <span className="brand-subtitle">Media explorer</span>
            </div>
          </div>

          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Favorites ({favorites.length})
            </NavLink>
          </nav>
        </header>

        <main className="page-shell">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  movies={movies}
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  moodInput={moodInput}
                  setMoodInput={setMoodInput}
                  isLoading={isLoading}
                  error={error}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onMoodSubmit={handleMoodSubmit}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  observerRef={observerRef}
                  debouncedQuery={debouncedQuery}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  favorites={favorites}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function HomePage({
  movies,
  searchInput,
  setSearchInput,
  moodInput,
  setMoodInput,
  isLoading,
  error,
  favoriteIds,
  onToggleFavorite,
  onMoodSubmit,
  onLoadMore,
  hasMore,
  observerRef,
  debouncedQuery,
}) {
  return (
    <div className="home-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Trending now</p>
          <h1>Discover the next obsession.</h1>
          <p className="hero-copy">
            Search, scroll, and save your favorites without losing momentum.
          </p>
        </div>

        <div className="search-panel">
          <label className="field-label" htmlFor="movie-search">
            Search library
          </label>
          <input
            id="movie-search"
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search for a movie title..."
          />

          <form className="mood-form" onSubmit={onMoodSubmit}>
            <label className="field-label" htmlFor="mood-search">
              Mood matcher
            </label>
            <div className="mood-row">
              <input
                id="mood-search"
                type="text"
                value={moodInput}
                onChange={(event) => setMoodInput(event.target.value)}
                placeholder="I want something uplifting but thrilling"
              />
              <button type="submit">Match</button>
            </div>
          </form>
        </div>
      </section>

      <section className="results-header">
        <h2>{debouncedQuery ? `Results for “${debouncedQuery}”` : 'Popular movies'}</h2>
        {isLoading && <span className="loading-pill">Loading…</span>}
      </section>

      {error && <div className="notice error">{error}</div>}

      <section className="movie-grid">
        {movies.map((movie) => {
          const isFavorite = favoriteIds.has(movie.id)

          return (
            <article key={`${movie.id}-${movie.title}`} className="movie-card">
              <button
                type="button"
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFavorite(movie)}
                aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
              >
                {isFavorite ? '♥' : '♡'}
              </button>

              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} loading="lazy" />
              ) : (
                <div className="poster-placeholder">No Poster</div>
              )}

              <div className="movie-copy">
                <h3>{movie.title}</h3>
                <div className="movie-meta">
                  <span>{movie.year}</span>
                  <span>⭐ {movie.rating}</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {hasMore && !error && (
        <div className="loader-trigger" ref={observerRef} onClick={onLoadMore} aria-label="Load more movies">
          {isLoading ? 'Fetching more titles…' : 'Load more'}
        </div>
      )}
    </div>
  )
}

function FavoritesPage({ favorites, favoriteIds, onToggleFavorite }) {
  return (
    <div className="favorites-page">
      <div className="results-header">
        <h2>My favorites</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>Your saved movies will appear here.</p>
        </div>
      ) : (
        <section className="movie-grid">
          {favorites.map((movie) => (
            <article key={`favorite-${movie.id}`} className="movie-card">
              <button
                type="button"
                className={`favorite-button ${favoriteIds.has(movie.id) ? 'active' : ''}`}
                onClick={() => onToggleFavorite(movie)}
                aria-label={`Remove ${movie.title} from favorites`}
              >
                ♥
              </button>

              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} loading="lazy" />
              ) : (
                <div className="poster-placeholder">No Poster</div>
              )}

              <div className="movie-copy">
                <h3>{movie.title}</h3>
                <div className="movie-meta">
                  <span>{movie.year || movie.releaseDate?.slice(0, 4)}</span>
                  <span>⭐ {movie.rating || 'NR'}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

export default App
