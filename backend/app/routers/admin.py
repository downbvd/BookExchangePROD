from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3

from ..database import get_db
from ..routers.auth import get_current_user

router = APIRouter()

class AdminStats(BaseModel):
    total_books: int
    validated_books: int
    pending_books: int
    total_users: int
    donors: int
    readers: int
    total_exchanges: int
    completed_exchanges: int

@router.get("/stats", response_model=AdminStats)
def get_stats(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM books")
    total_books = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM books WHERE validated = 1")
    validated_books = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM books WHERE validated = 0")
    pending_books = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM users")
    total_users = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'donor'")
    donors = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'reader'")
    readers = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM exchange_requests")
    total_exchanges = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM exchange_requests WHERE status = 'completed'")
    completed_exchanges = cursor.fetchone()["count"]
    
    conn.close()
    
    return {
        "total_books": total_books,
        "validated_books": validated_books,
        "pending_books": pending_books,
        "total_users": total_users,
        "donors": donors,
        "readers": readers,
        "total_exchanges": total_exchanges,
        "completed_exchanges": completed_exchanges
    }

@router.get("/books")
def get_unvalidated_books(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT b.*, u.username as donor_username
        FROM books b
        JOIN users u ON b.donor_id = u.id
        WHERE b.validated = 0
        ORDER BY b.created_at DESC
    """)
    
    books = cursor.fetchall()
    conn.close()
    
    return [dict(book) for book in books]

@router.put("/books/{book_id}/validate")
def validate_book(book_id: int, current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    cursor.execute("UPDATE books SET validated = 1 WHERE id = ?", (book_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Book validated successfully"}

@router.get("/users")
def get_all_users(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.role, u.city, u.created_at,
               COUNT(b.id) as books_count
        FROM users u
        LEFT JOIN books b ON u.id = b.donor_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    """)
    
    users = cursor.fetchall()
    conn.close()
    
    from ..security import decrypt_data
    return [
        {
            "id": u["id"],
            "username": u["username"],
            "email": decrypt_data(u["email"]),
            "role": u["role"],
            "city": u["city"],
            "books_count": u["books_count"],
            "created_at": u["created_at"]
        }
        for u in users
    ]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("DELETE FROM reviews WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM exchange_requests WHERE requester_id = ? OR donor_id = ?", (user_id, user_id))
    cursor.execute("DELETE FROM friendships WHERE user_id = ? OR friend_id = ?", (user_id, user_id))
    cursor.execute("SELECT id FROM books WHERE donor_id = ?", (user_id,))
    book_ids = [r["id"] for r in cursor.fetchall()]
    for book_id in book_ids:
        cursor.execute("DELETE FROM reviews WHERE book_id = ?", (book_id,))
        cursor.execute("DELETE FROM exchange_requests WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM book_photos WHERE book_id IN (SELECT id FROM books WHERE donor_id = ?)", (user_id,))
    cursor.execute("DELETE FROM books WHERE donor_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "User deleted successfully"}

@router.get("/all-books")
def get_all_books_admin(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT b.*, u.username as donor_username
        FROM books b
        JOIN users u ON b.donor_id = u.id
        ORDER BY b.created_at DESC
    """)
    
    books = cursor.fetchall()
    conn.close()
    
    return [dict(book) for book in books]

@router.delete("/books/{book_id}")
def delete_book_admin(book_id: int, current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM books WHERE id = ?", (book_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Book not found")
    
    cursor.execute("DELETE FROM reviews WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM exchange_requests WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM book_photos WHERE book_id = ?", (book_id,))
    cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Book deleted successfully"}
