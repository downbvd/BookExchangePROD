from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter()

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    book_id: int
    user_id: int
    username: str
    rating: int
    comment: Optional[str]
    created_at: str

@router.get("/book/{book_id}", response_model=List[ReviewResponse])
def get_book_reviews(book_id: int):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT r.id, r.book_id, r.user_id, u.username, r.rating, r.comment, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.book_id = ?
        ORDER BY r.created_at DESC
    """, (book_id,))
    
    reviews = cursor.fetchall()
    conn.close()
    
    return [dict(review) for review in reviews]

@router.post("/book/{book_id}", response_model=ReviewResponse)
def create_review(book_id: int, review: ReviewCreate, current_user = Depends(get_current_user)):
    if current_user["role"] != "reader":
        raise HTTPException(status_code=403, detail="Only readers can leave reviews")
    
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    cursor.execute("""
        INSERT INTO reviews (book_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)
    """, (book_id, current_user["id"], review.rating, review.comment))
    
    conn.commit()
    
    cursor.execute("""
        SELECT r.id, r.book_id, r.user_id, u.username, r.rating, r.comment, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    """, (cursor.lastrowid,))
    
    new_review = cursor.fetchone()
    conn.close()
    
    return dict(new_review)
