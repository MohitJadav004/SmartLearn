# SmartLearn - Online Learning Platform

An online learning platform where teachers can create courses and students can learn from them while tracking their progress.

## Technology Stack

- **Frontend**: React 19 + React Router + Tailwind CSS
- **Backend**: Laravel 12 + MySQL
- **Authentication**: Laravel Sanctum (Token-based)

## Features

- ✅ User Registration with Role Selection (Student/Teacher)
- ✅ User Login with Token-based Authentication
- ✅ Role-based Dashboard Redirect
- ✅ Student Dashboard with Course Progress Tracking
- ✅ Teacher Dashboard with Course Management
- ✅ Responsive UI with Tailwind CSS

## Project Structure

```
smartlearn1/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── AuthController.php
│   │   └── Models/
│   │       └── User.php
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── config/
│   │   └── cors.php
│   ├── .env
│   ├── .env.example
│   └── composer.json
└── frontend/            # React App
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   └── TeacherDashboard.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` (already configured)
   - The database is configured to use MySQL:
     ```
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=smartlearn
     DB_USERNAME=root
     DB_PASSWORD=
     ```

4. **Create MySQL Database**
   ```sql
   CREATE DATABASE smartlearn;
   ```

5. **Run migrations**
   ```bash
   php artisan migrate
   ```

6. **Install Sanctum for API Authentication**
   ```bash
   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   php artisan migrate
   ```

7. **Start Laravel Server**
   ```bash
   php artisan serve
   ```
   The server will run at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`

## API Endpoints

### Authentication Routes

- **POST** `/api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "student" // or "teacher"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/auth/me` - Get current authenticated user (requires token)

- **POST** `/api/auth/logout` - Logout user (requires token)

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT-like token via Laravel Sanctum
3. Token is stored in localStorage
4. Token is sent in `Authorization: Bearer {token}` header for authenticated requests
5. Frontend redirects user to their dashboard based on role
   - Teachers → `/teacher-dashboard`
   - Students → `/student-dashboard`

## Database Schema

### Users Table
- `id` - Primary Key
- `name` - User Name
- `email` - User Email (Unique)
- `password` - Hashed Password
- `role` - Enum: 'student' | 'teacher'
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Future Features to Implement

- [ ] Course CRUD operations
- [ ] Lesson management
- [ ] Video uploads and streaming
- [ ] Student enrollment
- [ ] Progress tracking and analytics
- [ ] Discussion forums
- [ ] Assignments and quizzes
- [ ] Email notifications
- [ ] Payment/Subscription system
- [ ] Admin dashboard

## Running the Application

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using Composer Scripts (if configured)

From the backend directory:
```bash
composer run dev
```

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check `.env` database credentials
   - Run `php artisan migrate` to create tables

2. **Composer Dependencies Error**
   - Delete `vendor` folder and `composer.lock`
   - Run `composer install` again

### Frontend Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:8000`
   - Check browser console for CORS errors
   - Verify `AuthContext.jsx` API URL matches backend

2. **Module Not Found**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

## Notes

- The application uses JWT tokens for stateless authentication
- All API requests must include the Authorization header with the token
- Protected routes automatically redirect to login if user is not authenticated
- Role-based access control is enforced on both backend and frontend
- Frontend redirects users to their appropriate dashboard after login based on their role

## Development Tips

- Use Postman or Insomnia to test API endpoints
- Check browser DevTools Network tab to inspect API requests
- Use Laravel Tinker for database debugging: `php artisan tinker`
- Check Laravel logs: `storage/logs/laravel.log`

