import sqlite3
import uuid
import time
from typing import List, Dict, Any, Optional

DB_FILE = "researcher.db"

def get_connection():
    # Use check_same_thread=False since FastAPI runs in multiple threads
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create chats table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL
    )
    ''')
    
    # Create messages table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
    )
    ''')
    
    conn.commit()
    conn.close()

# Chat Operations
def create_chat(title: str = "New Research") -> Dict[str, Any]:
    chat_id = str(uuid.uuid4())
    created_at = int(time.time() * 1000)
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chats (id, title, created_at) VALUES (?, ?, ?)",
        (chat_id, title, created_at)
    )
    conn.commit()
    conn.close()
    
    return {"id": chat_id, "title": title, "created_at": created_at, "messages": []}

def get_all_chats() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chats ORDER BY created_at DESC")
    chats = [dict(row) for row in cursor.fetchall()]
    
    # Optionally, we could fetch messages here, but fetching on demand is better
    # For this simple app, we'll fetch them all so it matches the frontend's expected state
    for chat in chats:
        cursor.execute("SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC", (chat["id"],))
        chat["messages"] = [dict(row) for row in cursor.fetchall()]
        
    conn.close()
    return chats

def get_chat(chat_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chats WHERE id = ?", (chat_id,))
    chat_row = cursor.fetchone()
    
    if not chat_row:
        conn.close()
        return None
        
    chat = dict(chat_row)
    cursor.execute("SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC", (chat_id,))
    chat["messages"] = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return chat

def rename_chat(chat_id: str, title: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE chats SET title = ? WHERE id = ?", (title, chat_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def delete_chat(chat_id: str) -> bool:
    conn = get_connection()
    # Enable foreign keys for CASCADE delete
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

# Message Operations
def add_message(chat_id: str, role: str, content: str) -> None:
    created_at = int(time.time() * 1000)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (chat_id, role, content, created_at)
    )
    
    # Auto-title the chat if this is the first user message and title is "New Research"
    if role == "user":
        cursor.execute("SELECT title FROM chats WHERE id = ?", (chat_id,))
        row = cursor.fetchone()
        if row and row["title"] == "New Research":
            new_title = content[:40] + ("…" if len(content) > 40 else "")
            cursor.execute("UPDATE chats SET title = ? WHERE id = ?", (new_title, chat_id))
            
    conn.commit()
    conn.close()

# Initialize on load
init_db()
