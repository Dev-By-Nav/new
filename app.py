from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = Path("flashcards.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        cur = conn.cursor()

        # USERS (simple code login)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_code TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

        # DECKS (with tags)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS decks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                subject TEXT NOT NULL,
                exam_board TEXT NOT NULL,
                year_group TEXT NOT NULL
            );
        """)

        # CARDS
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deck_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                FOREIGN KEY (deck_id) REFERENCES decks(id)
            );
        """)

        # DECK PROGRESS (per user per deck totals)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS deck_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                deck_id INTEGER NOT NULL,
                answered INTEGER NOT NULL DEFAULT 0,
                correct INTEGER NOT NULL DEFAULT 0,
                incorrect INTEGER NOT NULL DEFAULT 0,
                UNIQUE(user_id, deck_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (deck_id) REFERENCES decks(id)
            );
        """)

        conn.commit()


def generate_unique_user_code():
    """Generate a unique 6-digit code as a string."""
    with get_db() as conn:
        cur = conn.cursor()
        while True:
            code = str(random.randint(100000, 999999))
            cur.execute("SELECT 1 FROM users WHERE user_code = ?", (code,))
            if cur.fetchone() is None:
                return code


@app.get("/")
def home():
    return "Backend is running"


# ---------- AUTH ROUTES ----------

@app.post("/api/auth/signup")
def signup():
    user_code = generate_unique_user_code()
    created_at = datetime.utcnow().isoformat()

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (user_code, created_at) VALUES (?, ?)",
            (user_code, created_at)
        )
        conn.commit()
        user_id = cur.lastrowid

    return jsonify({"user_id": user_id, "user_code": user_code}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    user_code = str(data.get("user_code", "")).strip()

    if not user_code:
        return jsonify({"error": "user_code is required"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, user_code FROM users WHERE user_code = ?", (user_code,))
        user = cur.fetchone()

    if user is None:
        return jsonify({"error": "Invalid user code"}), 401

    return jsonify({"user_id": user["id"], "user_code": user["user_code"]}), 200


# ---------- DECK ROUTES ----------

@app.get("/api/decks")
def get_decks():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM decks")
        decks = [dict(row) for row in cur.fetchall()]
    return jsonify(decks)


@app.post("/api/decks")
def add_deck():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    subject = data.get("subject")
    exam_board = data.get("exam_board")
    year_group = data.get("year_group")

    if not all([name, subject, exam_board, year_group]):
        return jsonify({"error": "name, subject, exam_board, and year_group are required"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO decks (name, subject, exam_board, year_group) VALUES (?, ?, ?, ?)",
            (name, subject, exam_board, year_group),
        )
        conn.commit()
        deck_id = cur.lastrowid

    return jsonify({
        "id": deck_id,
        "name": name,
        "subject": subject,
        "exam_board": exam_board,
        "year_group": year_group
    }), 201


# ---------- CARD ROUTES ----------

@app.get("/api/decks/<int:deck_id>/cards")
def get_cards(deck_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM cards WHERE deck_id=?", (deck_id,))
        cards = [dict(row) for row in cur.fetchall()]
    return jsonify(cards)


@app.post("/api/decks/<int:deck_id>/cards")
def add_card(deck_id):
    data = request.get_json(silent=True) or {}
    question = data.get("question")
    answer = data.get("answer")

    if not question or not answer:
        return jsonify({"error": "question and answer are required"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO cards (deck_id, question, answer) VALUES (?, ?, ?)",
            (deck_id, question, answer),
        )
        conn.commit()
        card_id = cur.lastrowid

    return jsonify({
        "id": card_id,
        "deck_id": deck_id,
        "question": question,
        "answer": answer
    }), 201


# ---------- PROGRESS ROUTES (PER DECK TOTALS) ----------

@app.post("/api/progress/deck")
def update_deck_progress():
    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    deck_id = data.get("deck_id")
    is_correct = data.get("is_correct")

    if user_id is None or deck_id is None or is_correct is None:
        return jsonify({"error": "user_id, deck_id, and is_correct are required"}), 400

    if not isinstance(is_correct, bool):
        return jsonify({"error": "is_correct must be true/false"}), 400

    with get_db() as conn:
        cur = conn.cursor()

        # Update row if it exists
        if is_correct:
            cur.execute("""
                UPDATE deck_progress
                SET answered = answered + 1,
                    correct = correct + 1
                WHERE user_id = ? AND deck_id = ?
            """, (user_id, deck_id))
        else:
            cur.execute("""
                UPDATE deck_progress
                SET answered = answered + 1,
                    incorrect = incorrect + 1
                WHERE user_id = ? AND deck_id = ?
            """, (user_id, deck_id))

        # If no row existed, insert one
        if cur.rowcount == 0:
            cur.execute("""
                INSERT INTO deck_progress (user_id, deck_id, answered, correct, incorrect)
                VALUES (?, ?, 1, ?, ?)
            """, (user_id, deck_id, 1 if is_correct else 0, 0 if is_correct else 1))

        conn.commit()

    return jsonify({"message": "Progress updated"}), 200


@app.get("/api/progress/deck")
def get_deck_progress():
    user_id = request.args.get("user_id", type=int)
    deck_id = request.args.get("deck_id", type=int)

    if user_id is None or deck_id is None:
        return jsonify({"error": "user_id and deck_id are required"}), 400

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT answered, correct, incorrect
            FROM deck_progress
            WHERE user_id = ? AND deck_id = ?
        """, (user_id, deck_id))
        row = cur.fetchone()

    if row is None:
        return jsonify({"answered": 0, "correct": 0, "incorrect": 0}), 200

    return jsonify({
        "answered": row["answered"],
        "correct": row["correct"],
        "incorrect": row["incorrect"]
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
