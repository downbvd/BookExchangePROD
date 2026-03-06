# BookExchange Platform Specification

## Project Overview
- **Project Name**: BookExchange
- **Type**: Full-stack web application
- **Core Functionality**: A platform where users can exchange books, share reviews, and connect with like-minded readers
- **Target Users**: Donors (people giving away books), Readers (people seeking books), Administrators

## Technology Stack
- **Backend**: Python FastAPI
- **Frontend**: React with Vite
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Data Encryption**:Fernet for sensitive user data encryption

## Database Models

### User
- id (PK)
- username (unique)
- email (unique, encrypted)
- password_hash
- role (donor/reader/admin)
- city
- created_at
- updated_at

### Book
- id (PK)
- title (required)
- author (required)
- genre
- year_of_publication
- publisher
- language
- binding (hardcover/softcover)
- pages
- size (pocket/standard/gift)
- condition (new/good/minor_damage)
- location_city
- location_metro
- additional_conditions
- donor_id (FK)
- status (available/reserved/taken)
- validated (boolean)
- created_at

### BookPhoto
- id (PK)
- book_id (FK)
- photo_url
- photo_type (cover/inside)

### Review
- id (PK)
- book_id (FK)
- user_id (FK)
- rating (1-5)
- comment
- created_at

### ExchangeRequest
- id (PK)
- book_id (FK)
- requester_id (FK)
- donor_id (FK)
- status (pending/accepted/rejected/completed)
- created_at

### Friendship
- id (PK)
- user_id (FK)
- friend_id (FK)
- status (pending/accepted)

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Books
- GET /api/books (search, filter by genre, location, city)
- GET /api/books/{id}
- POST /api/books (donor only)
- PUT /api/books/{id} (donor only, own books)
- DELETE /api/books/{id} (donor only, own books)
- GET /api/books/demanded (most requested books)

### Reviews
- GET /api/books/{id}/reviews
- POST /api/books/{id}/reviews (reader only)

### Users
- GET /api/users/{id}
- POST /api/users/{id}/friends
- GET /api/users/{id}/friends

### Admin
- GET /api/admin/stats
- GET /api/admin/books (unvalidated)
- PUT /api/admin/books/{id}/validate

## UI/UX Specification

### Color Palette
- Primary: #2D5A27 (Forest Green)
- Secondary: #8B4513 (Saddle Brown)
- Accent: #D4A574 (Tan)
- Background: #FAF8F5 (Cream)
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #666666
- Success: #4CAF50
- Warning: #FF9800
- Error: #F44336

### Typography
- Headings: "Playfair Display", serif
- Body: "Source Sans 3", sans-serif
- Font sizes: h1: 2.5rem, h2: 2rem, h3: 1.5rem, body: 1rem

### Layout
- Max width: 1200px
- Header: Fixed top navigation with logo, search, auth buttons
- Sidebar: Filters on browse page
- Cards: Book items in grid (3-4 columns desktop, 2 tablet, 1 mobile)

### Components
- BookCard: Cover image, title, author, location, condition badge
- SearchBar: Input with filters dropdown
- FilterPanel: Genre, location, condition checkboxes
- ReviewCard: User avatar, rating stars, comment
- StatsCard: Icon, number, label for admin panel

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Functional Requirements

### Donor Features
- Register/login
- Add book with all attributes
- Specify exchange location (city/metro)
- View own listed books
- Accept/reject exchange requests

### Reader Features
- Register/login
- Search by title, author, genre, city
- Filter by genre, location, condition
- View book details and location
- Send exchange request
- Leave reviews and ratings
- Connect with other users (friends)

### Admin Features
- View statistics (total books, users, exchanges)
- Validate uploaded books
- Access admin panel

## Acceptance Criteria
1. Users can register with role selection (donor/reader)
2. Donors can add books with all specified attributes
3. Readers can search and filter books by genre, location, city
4. Readers can view book details including location
5. Readers can send exchange requests to donors
6. Readers can leave reviews and ratings
7. Users can connect as friends
8. Admins can view platform statistics
9. Admins can validate books
10. All user data is encrypted
11. Response time under 5 seconds for 10,000 books
12. Application is responsive on mobile/tablet/desktop
