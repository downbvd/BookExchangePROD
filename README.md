# BookExchange Platform

A book exchange platform where users can exchange books, share reviews, and connect with like-minded readers.

## Features

- **Three Roles**: Donor, Reader, Administrator
- **Book Management**: Add, search, filter books by genre/location
- **Reviews & Ratings**: Leave reviews for books
- **Exchange Requests**: Request books from donors
- **Admin Panel**: Validate books, view statistics
- **Data Encryption**: User data is encrypted

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Database**: SQLite (easily scalable to PostgreSQL)
- **Authentication**: JWT with bcrypt password hashing

## Quick Start

### Prerequisites

- Python 3.8+ with pip
- Node.js 18+

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The backend will run at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run at http://localhost:5173

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Default Admin User

To create an admin user, register with the role set to `admin` or modify the database directly.

## Project Structure

```
BookExchange/
├── backend/
│   ├── app/
│   │   ├── database.py      # Database setup
│   │   ├── security.py      # Encryption utilities
│   │   └── routers/         # API endpoints
│   │       ├── auth.py      # Authentication
│   │       ├── books.py     # Book CRUD
│   │       ├── users.py     # User & exchange
│   │       ├── reviews.py   # Reviews
│   │       └── admin.py     # Admin panel
│   ├── main.py              # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React app
│   │   └── index.css        # Styles
│   ├── package.json
│   └── vite.config.js
├── SPEC.md                   # Detailed specification
└── README.md
```

## User Flows

### As a Donor
1. Register as a donor
2. Add books with details and location
3. Wait for admin validation
4. Accept exchange requests from readers

### As a Reader
1. Register as a reader
2. Browse and search books
3. Send exchange requests
4. Leave reviews after receiving books

### As an Admin
1. Access admin panel at /admin
2. View platform statistics
3. Validate new book uploads
