from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

from ..database import get_db
from ..routers.auth import get_current_user
from ..security import decrypt_data

router = APIRouter()

class UserProfile(BaseModel):
    id: int
    username: str
    role: str
    city: Optional[str]
    books_count: int = 0

@router.get("/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: int):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.id, u.username, u.role, u.city, COUNT(b.id) as books_count
        FROM users u
        LEFT JOIN books b ON u.id = b.donor_id AND b.validated = 1
        WHERE u.id = ?
        GROUP BY u.id
    """, (user_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return dict(user)

@router.get("/{user_id}/friends", response_model=List[UserProfile])
def get_friends(user_id: int, current_user = Depends(get_current_user)):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.id, u.username, u.role, u.city, COUNT(b.id) as books_count
        FROM friendships f
        JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
        LEFT JOIN books b ON u.id = b.donor_id AND b.validated = 1
        WHERE f.status = 'accepted'
        GROUP BY u.id
    """, (user_id, user_id))
    
    friends = cursor.fetchall()
    conn.close()
    
    return [dict(friend) for friend in friends]

@router.post("/{user_id}/friends")
def add_friend(user_id: int, current_user = Depends(get_current_user)):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        SELECT id FROM friendships 
        WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    """, (current_user["id"], user_id, user_id, current_user["id"]))
    
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Friendship already exists")
    
    cursor.execute("""
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES (?, ?, 'pending')
    """, (current_user["id"], user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Friend request sent"}

@router.get("/requests/incoming")
def get_incoming_requests(current_user = Depends(get_current_user)):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT e.id, e.book_id, e.requester_id, u.username, b.title, e.status, e.created_at
        FROM exchange_requests e
        JOIN users u ON e.requester_id = u.id
        JOIN books b ON e.book_id = b.id
        WHERE e.donor_id = ?
        ORDER BY e.created_at DESC
    """, (current_user["id"],))
    
    requests = cursor.fetchall()
    conn.close()
    
    return [dict(req) for req in requests]

@router.get("/requests/outgoing")
def get_outgoing_requests(current_user = Depends(get_current_user)):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT e.id, e.book_id, e.donor_id, u.username, b.title, e.status, e.created_at
        FROM exchange_requests e
        JOIN users u ON e.donor_id = u.id
        JOIN books b ON e.book_id = b.id
        WHERE e.requester_id = ?
        ORDER BY e.created_at DESC
    """, (current_user["id"],))
    
    requests = cursor.fetchall()
    conn.close()
    
    return [dict(req) for req in requests]

@router.put("/requests/{request_id}/accept")
def accept_request(request_id: int, current_user = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM exchange_requests WHERE id = ? AND donor_id = ?
    """, (request_id, current_user["id"]))
    
    exchange = cursor.fetchone()
    if not exchange:
        raise HTTPException(status_code=404, detail="Request not found")
    
    cursor.execute("""
        UPDATE exchange_requests SET status = 'accepted' WHERE id = ?
    """, (request_id,))
    
    cursor.execute("UPDATE books SET status = 'taken' WHERE id = ?", (exchange["book_id"],))
    
    conn.commit()
    conn.close()
    
    return {"message": "Request accepted"}

@router.put("/requests/{request_id}/reject")
def reject_request(request_id: int, current_user = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM exchange_requests WHERE id = ? AND donor_id = ?
    """, (request_id, current_user["id"]))
    
    exchange = cursor.fetchone()
    if not exchange:
        raise HTTPException(status_code=404, detail="Request not found")
    
    cursor.execute("""
        UPDATE exchange_requests SET status = 'rejected' WHERE id = ?
    """, (request_id,))
    
    cursor.execute("UPDATE books SET status = 'available' WHERE id = ?", (exchange["book_id"],))
    
    conn.commit()
    conn.close()
    
    return {"message": "Request rejected"}
