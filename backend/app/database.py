import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('donor', 'reader', 'admin')),
            city TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT,
            year_of_publication INTEGER,
            publisher TEXT,
            language TEXT,
            binding TEXT CHECK(binding IN ('hardcover', 'softcover')),
            pages INTEGER,
            size TEXT CHECK(size IN ('pocket', 'standard', 'gift')),
            condition TEXT CHECK(condition IN ('new', 'good', 'minor_damage')),
            location_city TEXT,
            location_metro TEXT,
            additional_conditions TEXT,
            donor_id INTEGER NOT NULL,
            status TEXT DEFAULT 'available' CHECK(status IN ('available', 'reserved', 'taken')),
            validated INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (donor_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS book_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            photo_url TEXT NOT NULL,
            photo_type TEXT CHECK(photo_type IN ('cover', 'inside')),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS exchange_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            requester_id INTEGER NOT NULL,
            donor_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(id),
            FOREIGN KEY (requester_id) REFERENCES users(id),
            FOREIGN KEY (donor_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (friend_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_location ON books(location_city)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id)")
    
    conn.commit()
    conn.close()
