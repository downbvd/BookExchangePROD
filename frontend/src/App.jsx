import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const API_BASE = '/api'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      boxShadow: 'var(--shadow-sm)',
      zIndex: 100,
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.9rem 1.5rem'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: 'none' }}>
          <span style={{ fontSize: '1.5rem', filter: 'grayscale(100%)' }}>📚</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.5px' }}>
            BookExchange
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/browse" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Browse</Link>
          {user?.role === 'donor' && <Link to="/add-book" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add Book</Link>}
          {user?.role === 'admin' && <Link to="/admin" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</Link>}
          {user ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'IBM Plex Mono, monospace' }}>
                {user.username}
              </span>
              <button className="btn btn-outline" onClick={logout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }}>Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Home() {
  return (
    <div style={{ paddingTop: '5rem' }}>
      <section className="hero-section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '-1px' }}>
            Share Books, Make Friends
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#999999', maxWidth: '500px', margin: '0 auto 2rem', fontFamily: 'IBM Plex Mono, monospace' }}>
            A minimalist book exchange platform for the modern reader.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.8rem 2rem' }}>
            Get Started
          </Link>
        </div>
      </section>

      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 className="text-center mb-3" style={{ fontSize: '1.25rem', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '2px', textTransform: 'uppercase' }}>How It Works</h2>
        <div className="grid grid-3">
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', filter: 'grayscale(100%)' }}>📖</div>
            <h3 style={{ fontSize: '1rem', fontFamily: 'IBM Plex Mono, monospace' }}>List Your Books</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Share books you no longer need with detailed descriptions.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', filter: 'grayscale(100%)' }}>🔍</div>
            <h3 style={{ fontSize: '1rem', fontFamily: 'IBM Plex Mono, monospace' }}>Discover</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Browse by genre, author, or location. Find your next read.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', filter: 'grayscale(100%)' }}>🤝</div>
            <h3 style={{ fontSize: '1rem', fontFamily: 'IBM Plex Mono, monospace' }}>Exchange</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Meet locally, exchange books, leave reviews.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      navigate('/browse')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 className="text-center mb-3">Welcome Back</h1>
          <div className="card" style={{ padding: '2rem' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Login
              </button>
            </form>
            <p className="text-center mt-2">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'reader',
    city: ''
  })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(formData)
      navigate('/browse')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 className="text-center mb-3">Join BookExchange</h1>
          <div className="card" style={{ padding: '2rem' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="input"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="input"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">I want to be a</label>
                <select className="select" name="role" value={formData.role} onChange={handleChange}>
                  <option value="reader">Reader (exchange books)</option>
                  <option value="donor">Donor (give away books)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="input"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city for book exchanges"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Account
              </button>
            </form>
            <p className="text-center mt-2">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookCard({ book }) {
  const getConditionClass = (condition) => {
    if (condition === 'new') return 'badge-success'
    if (condition === 'good') return 'badge-primary'
    return 'badge-warning'
  }

  return (
    <div className="card">
      <div className="book-cover" style={{ height: '180px', position: 'relative' }}>
        <span style={{ fontSize: '3rem', filter: 'grayscale(100%)', opacity: 0.6 }}>📖</span>
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>
          {book.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.author}</p>
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
          {book.genre && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{book.genre}</span>}
          {book.condition && <span className={`badge ${getConditionClass(book.condition)}`} style={{ fontSize: '0.6rem' }}>{book.condition}</span>}
        </div>
        {book.location_city && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>
            {book.location_city}
          </p>
        )}
        <Link to={`/book/${book.id}`} className="btn btn-outline mt-2" style={{ width: '100%', padding: '0.4rem', fontSize: '0.65rem' }}>
          View
        </Link>
      </div>
    </div>
  )
}

function BrowseBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    city: ''
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.city) params.append('city', filters.city)

      const res = await fetch(`${API_BASE}/books?${params}`)
      const data = await res.json()
      setBooks(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks()
  }

  return (
    <div style={{ paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 className="mb-3">Browse Books</h1>

        <form onSubmit={handleSearch} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div className="grid grid-3">
            <input
              className="input"
              placeholder="Search by title or author..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="select"
              value={filters.genre}
              onChange={e => setFilters({ ...filters, genre: e.target.value })}
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Romance">Romance</option>
              <option value="Biography">Biography</option>
              <option value="Self-Help">Self-Help</option>
            </select>
            <input
              className="input"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={e => setFilters({ ...filters, city: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-2">Search</button>
        </form>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : books.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No books found. Try different filters.</p>
        ) : (
          <div className="grid grid-4">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function BookDetail() {
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [error, setError] = useState('')
  const { user, token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBook()
    fetchReviews()
  }, [id])

  const fetchBook = async () => {
    const res = await fetch(`${API_BASE}/books/${id}`)
    if (res.ok) {
      const data = await res.json()
      setBook(data)
    }
    setLoading(false)
  }

  const fetchReviews = async () => {
    const res = await fetch(`${API_BASE}/reviews/book/${id}`)
    if (res.ok) {
      const data = await res.json()
      setReviews(data)
    }
  }

  const handleRequest = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/books/${id}/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        alert('Request sent successfully!')
        fetchBook()
      } else {
        const err = await res.json()
        alert(err.detail || 'Failed to send request')
      }
    } catch (err) {
      alert('Failed to send request')
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${API_BASE}/reviews/book/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      })

      if (res.ok) {
        setReviewForm({ rating: 5, comment: '' })
        fetchReviews()
      } else {
        const err = await res.json()
        setError(err.detail || 'Failed to add review')
      }
    } catch (err) {
      setError('Failed to add review')
    }
  }

  if (loading) return <div className="loading" style={{ paddingTop: '6rem' }}><div className="spinner"></div></div>
  if (!book) return <div className="container" style={{ paddingTop: '6rem' }}>Book not found</div>

  return (
    <div style={{ paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <div style={{
              height: '300px',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8rem'
            }}>
              📖
            </div>
          </div>

          <div>
            <h1>{book.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>by {book.author}</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {book.genre && <span className="badge badge-primary">{book.genre}</span>}
              {book.condition && <span className="badge badge-success">{book.condition}</span>}
              <span className={`badge ${book.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                {book.status}
              </span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <p><strong>Location:</strong> {book.location_city || 'Not specified'}</p>
              {book.location_metro && <p><strong>Metro:</strong> {book.location_metro}</p>}
              {book.year_of_publication && <p><strong>Year:</strong> {book.year_of_publication}</p>}
              {book.language && <p><strong>Language:</strong> {book.language}</p>}
              {book.binding && <p><strong>Binding:</strong> {book.binding}</p>}
              {book.pages && <p><strong>Pages:</strong> {book.pages}</p>}
              {book.additional_conditions && (
                <p><strong>Notes:</strong> {book.additional_conditions}</p>
              )}
            </div>

            {book.status === 'available' && user?.id !== book.donor_id && (
              <button className="btn btn-primary mt-3" onClick={handleRequest}>
                Request This Book
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h2 className="mb-2">Reviews</h2>

          {user?.role === 'reader' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 className="mb-2">Leave a Review</h3>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${star <= reviewForm.rating ? 'filled' : ''}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{ cursor: 'pointer' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(review => (
                <div key={review.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>{review.username}</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddBook() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year_of_publication: '',
    publisher: '',
    language: '',
    binding: '',
    pages: '',
    size: '',
    condition: 'good',
    location_city: '',
    location_metro: '',
    additional_conditions: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { token } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const data = {
      ...formData,
      year_of_publication: formData.year_of_publication ? parseInt(formData.year_of_publication) : null,
      pages: formData.pages ? parseInt(formData.pages) : null
    }

    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setSuccess(true)
        setFormData({
          title: '', author: '', genre: '', year_of_publication: '',
          publisher: '', language: '', binding: '', pages: '',
          size: '', condition: 'good', location_city: '',
          location_metro: '', additional_conditions: ''
        })
      } else {
        const err = await res.json()
        setError(err.detail || 'Failed to add book')
      }
    } catch (err) {
      setError('Failed to add book')
    }
  }

  return (
    <div style={{ paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px' }}>
        <h1 className="mb-3">Add a Book</h1>
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Book added successfully! Pending validation.</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="input" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input className="input" name="author" value={formData.author} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Genre</label>
                <select className="select" name="genre" value={formData.genre} onChange={handleChange}>
                  <option value="">Select genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Romance">Romance</option>
                  <option value="Biography">Biography</option>
                  <option value="Self-Help">Self-Help</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Publication</label>
                <input className="input" name="year_of_publication" type="number" value={formData.year_of_publication} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Language</label>
                <input className="input" name="language" value={formData.language} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Binding</label>
                <select className="select" name="binding" value={formData.binding} onChange={handleChange}>
                  <option value="">Select binding</option>
                  <option value="hardcover">Hardcover</option>
                  <option value="softcover">Softcover</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Pages</label>
                <input className="input" name="pages" type="number" value={formData.pages} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Size</label>
                <select className="select" name="size" value={formData.size} onChange={handleChange}>
                  <option value="">Select size</option>
                  <option value="pocket">Pocket</option>
                  <option value="standard">Standard</option>
                  <option value="gift">Gift Edition</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Condition *</label>
              <select className="select" name="condition" value={formData.condition} onChange={handleChange}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="minor_damage">Minor Damage</option>
              </select>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="input" name="location_city" value={formData.location_city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nearest Metro/Station</label>
                <input className="input" name="location_metro" value={formData.location_metro} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Conditions</label>
              <textarea className="input" name="additional_conditions" rows={2} value={formData.additional_conditions} onChange={handleChange} placeholder="e.g., willing to exchange only for certain books" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Book</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [pendingBooks, setPendingBooks] = useState([])
  const [users, setUsers] = useState([])
  const [allBooks, setAllBooks] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, booksRes, usersRes, allBooksRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/books`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/all-books`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (booksRes.ok) setPendingBooks(await booksRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (allBooksRes.ok) setAllBooks(await allBooksRes.json())
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const validateBook = async (bookId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/books/${bookId}/validate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setPendingBooks(pendingBooks.filter(b => b.id !== bookId))
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      const res = await fetch(`${API_BASE}/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setAllBooks(allBooks.filter(b => b.id !== bookId))
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their books and reviews.')) return
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const banUser = async (userId) => {
    if (!confirm('Are you sure you want to ban this user?')) return
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const unbanUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="loading" style={{ paddingTop: '6rem' }}><div className="spinner"></div></div>

  return (
    <div style={{ paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 className="mb-3">Admin Panel</h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('stats')}>Statistics</button>
          <button className={`btn ${activeTab === 'books' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('books')}>All Books</button>
          <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('pending')}>Pending ({pendingBooks.length})</button>
          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`btn ${activeTab === 'api' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('api')}>API Docs</button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-4 mb-3">
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.total_books}</div>
              <div className="stat-label">Total Books</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.validated_books}</div>
              <div className="stat-label">Validated</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.pending_books}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.total_users}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.donors}</div>
              <div className="stat-label">Donors</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.readers}</div>
              <div className="stat-label">Readers</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.total_exchanges}</div>
              <div className="stat-label">Exchanges</div>
            </div>
            <div className="stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="stat-number">{stats.completed_exchanges}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <>
            <h2 className="mb-2">Books Pending Validation ({pendingBooks.length})</h2>
            {pendingBooks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No books pending validation.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingBooks.map(book => (
                  <div key={book.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3>{book.title}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>by {book.author} | Donor: {book.donor_username}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" onClick={() => validateBook(book.id)}>Validate</button>
                      <button className="btn btn-danger" onClick={() => deleteBook(book.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'books' && (
          <>
            <h2 className="mb-2">All Books ({allBooks.length})</h2>
            {allBooks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No books yet.</p>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Donor</th>
                      <th>Status</th>
                      <th>Validated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBooks.map(book => (
                      <tr key={book.id}>
                        <td>{book.id}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.donor_username}</td>
                        <td><span className="badge badge-primary">{book.status}</span></td>
                        <td>{book.validated ? 'Yes' : 'No'}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => deleteBook(book.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="mb-2">All Users ({users.length})</h2>
            {users.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No users yet.</p>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>City</th>
                      <th>Books</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td><span className="badge badge-primary">{user.role}</span></td>
                        <td>{user.banned ? <span className="badge badge-warning">Banned</span> : <span className="badge badge-success">Active</span>}</td>
                        <td>{user.city || '-'}</td>
                        <td>{user.books_count}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          {user.role !== 'admin' && (
                            <>
                              {user.banned ? (
                                <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginRight: '0.3rem' }} onClick={() => unbanUser(user.id)}>Unban</button>
                              ) : (
                                <button className="btn btn-warning" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', marginRight: '0.3rem' }} onClick={() => banUser(user.id)}>Ban</button>
                              )}
                              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => deleteUser(user.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'api' && (
          <ApiDocs />
        )}
      </div>
    </div>
  )
}

function ApiDocs() {
  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'Health check endpoint' },
    { method: 'GET', path: '/', desc: 'Root endpoint with API info' },
    { method: 'POST', path: '/api/auth/register', desc: 'Register a new user', body: '{ username, email, password, role, city }' },
    { method: 'POST', path: '/api/auth/login', desc: 'Login and get JWT token', body: 'username, password (form data)' },
    { method: 'GET', path: '/api/auth/me', desc: 'Get current user info (requires auth)' },
    { method: 'GET', path: '/api/books', desc: 'List all books with filters', params: 'search, genre, city, author, condition, status' },
    { method: 'GET', path: '/api/books/demanded', desc: 'Get most requested books' },
    { method: 'GET', path: '/api/books/{id}', desc: 'Get book details' },
    { method: 'POST', path: '/api/books', desc: 'Add a new book (donor only)', body: '{ title, author, genre, ... }' },
    { method: 'PUT', path: '/api/books/{id}', desc: 'Update a book' },
    { method: 'DELETE', path: '/api/books/{id}', desc: 'Delete a book' },
    { method: 'POST', path: '/api/books/{id}/request', desc: 'Request a book (reader only)' },
    { method: 'GET', path: '/api/reviews/book/{id}', desc: 'Get reviews for a book' },
    { method: 'POST', path: '/api/reviews/book/{id}', desc: 'Add a review (reader only)', body: '{ rating, comment }' },
    { method: 'GET', path: '/api/users/{id}', desc: 'Get user profile' },
    { method: 'GET', path: '/api/users/{id}/friends', desc: 'Get user friends' },
    { method: 'POST', path: '/api/users/{id}/friends', desc: 'Send friend request' },
    { method: 'GET', path: '/api/users/requests/incoming', desc: 'Get incoming exchange requests' },
    { method: 'GET', path: '/api/users/requests/outgoing', desc: 'Get outgoing exchange requests' },
    { method: 'PUT', path: '/api/users/requests/{id}/accept', desc: 'Accept exchange request' },
    { method: 'PUT', path: '/api/users/requests/{id}/reject', desc: 'Reject exchange request' },
    { method: 'GET', path: '/api/admin/stats', desc: 'Get platform statistics (admin only)' },
    { method: 'GET', path: '/api/admin/books', desc: 'Get unvalidated books (admin only)' },
    { method: 'PUT', path: '/api/admin/books/{id}/validate', desc: 'Validate a book (admin only)' },
    { method: 'GET', path: '/api/admin/users', desc: 'Get all users (admin only)' },
    { method: 'DELETE', path: '/api/admin/users/{id}', desc: 'Delete a user (admin only)' },
    { method: 'GET', path: '/api/admin/all-books', desc: 'Get all books (admin only)' },
    { method: 'DELETE', path: '/api/admin/books/{id}', desc: 'Delete a book (admin only)' },
    { method: 'PUT', path: '/api/admin/users/{id}/ban', desc: 'Ban a user (admin only)' },
    { method: 'PUT', path: '/api/admin/users/{id}/unban', desc: 'Unban a user (admin only)' },
  ]

  return (
    <div>
      <h2 className="mb-2">API Documentation</h2>
      <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
        Base URL: <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem' }}>http://localhost:8000</code>
      </p>
      <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
        Authentication: Add <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem' }}>Authorization: Bearer &lt;token&gt;</code> header
      </p>
      
      {endpoints.map((ep, i) => (
        <div key={i} className="api-endpoint" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
            <span className="path">{ep.path}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ep.desc}</p>
          {ep.params && <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Params: <code style={{ background: '#f5f5f5' }}>{ep.params}</code></p>}
          {ep.body && <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Body: <code style={{ background: '#f5f5f5' }}>{ep.body}</code></p>}
        </div>
      ))}
    </div>
  )
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseBooks />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  )
}

export default App
