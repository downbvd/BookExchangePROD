from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter()

class BookCreate(BaseModel):
    title: str
    author: str
    genre: Optional[str] = None
    year_of_publication: Optional[int] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    binding: Optional[str] = None
    pages: Optional[int] = None
    size: Optional[str] = None
    condition: Optional[str] = None
    location_city: Optional[str] = None
    location_metro: Optional[str] = None
    additional_conditions: Optional[str] = None
    photos: Optional[List[str]] = None

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    genre: Optional[str]
    year_of_publication: Optional[int]
    publisher: Optional[str]
    language: Optional[str]
    binding: Optional[str]
    pages: Optional[int]
    size: Optional[str]
    condition: Optional[str]
    location_city: Optional[str]
    location_metro: Optional[str]
    additional_conditions: Optional[str]
    donor_id: int
    status: str
    validated: bool
    created_at: str

@router.get("", response_model=List[BookResponse])
def get_books(
    search: Optional[str] = None,
    genre: Optional[str] = None,
    city: Optional[str] = None,
    author: Optional[str] = None,
    condition: Optional[str] = None,
    status: str = "available",
    validated: bool = True,
    skip: int = 0,
    limit: int = 50
):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM books WHERE 1=1"
    params = []
    
    if search:
        query += " AND (title LIKE ? OR author LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if genre:
        query += " AND genre = ?"
        params.append(genre)
    if city:
        query += " AND location_city = ?"
        params.append(city)
    if author:
        query += " AND author LIKE ?"
        params.append(f"%{author}%")
    if condition:
        query += " AND condition = ?"
        params.append(condition)
    if status:
        query += " AND status = ?"
        params.append(status)
    if validated:
        query += " AND validated = 1"
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, skip])
    
    cursor.execute(query, params)
    books = cursor.fetchall()
    conn.close()
    
    return [dict(book) for book in books]

@router.get("/demanded", response_model=List[BookResponse])
def get_demanded_books(skip: int = 0, limit: int = 20):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT b.*, COUNT(e.id) as request_count 
        FROM books b
        LEFT JOIN exchange_requests e ON b.id = e.book_id
        WHERE b.validated = 1 AND b.status = 'available'
        GROUP BY b.id
        ORDER BY request_count DESC
        LIMIT ? OFFSET ?
    """, (limit, skip))
    
    books = cursor.fetchall()
    conn.close()
    
    return [dict(book) for book in books]

@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    conn.close()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return dict(book)

@router.post("", response_model=BookResponse)
def create_book(book: BookCreate, current_user = Depends(get_current_user)):
    if current_user["role"] not in ["donor", "admin"]:
        raise HTTPException(status_code=403, detail="Only donors can add books")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO books (
            title, author, genre, year_of_publication, publisher, language,
            binding, pages, size, condition, location_city, location_metro,
            additional_conditions, donor_id, validated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        book.title, book.author, book.genre, book.year_of_publication,
        book.publisher, book.language, book.binding, book.pages, book.size,
        book.condition, book.location_city, book.location_metro,
        book.additional_conditions, current_user["id"]
    ))
    
    book_id = cursor.lastrowid
    
    if book.photos:
        for photo_url in book.photos:
            cursor.execute("""
                INSERT INTO book_photos (book_id, photo_url, photo_type)
                VALUES (?, ?, 'cover')
            """, (book_id, photo_url))
    
    conn.commit()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    new_book = cursor.fetchone()
    conn.close()
    
    return dict(new_book)

@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book: BookCreate, current_user = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    existing = cursor.fetchone()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")
    if existing["donor_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor.execute("""
        UPDATE books SET
            title = ?, author = ?, genre = ?, year_of_publication = ?,
            publisher = ?, language = ?, binding = ?, pages = ?, size = ?,
            condition = ?, location_city = ?, location_metro = ?,
            additional_conditions = ?
        WHERE id = ?
    """, (
        book.title, book.author, book.genre, book.year_of_publication,
        book.publisher, book.language, book.binding, book.pages, book.size,
        book.condition, book.location_city, book.location_metro,
        book.additional_conditions, book_id
    ))
    
    conn.commit()
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    updated = cursor.fetchone()
    conn.close()
    
    return dict(updated)

@router.delete("/{book_id}")
def delete_book(book_id: int, current_user = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book["donor_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor.execute("DELETE FROM book_photos WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM exchange_requests WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM reviews WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Book deleted"}

@router.post("/{book_id}/request")
def request_book(book_id: int, current_user = Depends(get_current_user)):
    if current_user["role"] != "reader":
        raise HTTPException(status_code=403, detail="Only readers can request books")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book or not book["validated"]:
        raise HTTPException(status_code=404, detail="Book not found or not validated")
    if book["status"] != "available":
        raise HTTPException(status_code=400, detail="Book is not available")
    if book["donor_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot request your own book")
    
    cursor.execute("""
        INSERT INTO exchange_requests (book_id, requester_id, donor_id)
        VALUES (?, ?, ?)
    """, (book_id, current_user["id"], book["donor_id"]))
    
    cursor.execute("UPDATE books SET status = 'reserved' WHERE id = ?", (book_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Request sent successfully"}
