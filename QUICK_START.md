# Quick Start Guide - SmartLearn

## ⚡ 5-Minute Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm
- MySQL Server running (XAMPP)

### Backend Setup (2 minutes)

1. Open terminal and navigate to backend:
```bash
cd backend
composer install
```

2. Generate API key (if not done):
```bash
php artisan key:generate
```

3. Install Sanctum for authentication:
```bash
composer require laravel/sanctum
```

4. Create MySQL database in phpMyAdmin:
```sql
CREATE DATABASE smartlearn;
```

5. Run migrations:
```bash
php artisan migrate
```

6. Start Laravel server:
```bash
php artisan serve
```
✅ Backend running at: http://localhost:8000

### Frontend Setup (2 minutes)

1. Open another terminal and navigate to frontend:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```
✅ Frontend running at: http://localhost:5173

## 🎯 Testing the Application

### Create Test Accounts

1. Go to http://localhost:5173
2. Click "Register here"

**Teacher Account:**
- Name: John Teacher
- Email: teacher@example.com
- Password: password123
- Role: Teacher
- Click "Create Account"

**Student Account:**
- Name: Jane Student
- Email: student@example.com
- Password: password123
- Role: Student
- Click "Create Account"

### Test Login/Logout

1. Register a user → Gets redirected to their dashboard
2. Click "Logout" → Redirects to login page
3. Login with existing credentials → Redirects to appropriate dashboard

## 📁 File Structure Overview

**Backend Files Created:**
- `app/Http/Controllers/AuthController.php` - Authentication logic
- `app/Models/User.php` - Updated with role field
- `routes/api.php` - API endpoints
- `config/cors.php` - CORS configuration
- `database/migrations/*` - Database schema with role support

**Frontend Files Created:**
- `src/context/AuthContext.jsx` - Authentication state management
- `src/pages/Login.jsx` - Login page
- `src/pages/Register.jsx` - Registration page
- `src/pages/StudentDashboard.jsx` - Student dashboard
- `src/pages/TeacherDashboard.jsx` - Teacher dashboard
- `src/components/ProtectedRoute.jsx` - Route protection
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## 🔑 Key Features Implemented

✅ **Authentication System**
- User registration with email and password
- Role selection (Student/Teacher) during signup
- Token-based authentication with Laravel Sanctum

✅ **Role-Based Access**
- Students automatically redirect to `/student-dashboard`
- Teachers automatically redirect to `/teacher-dashboard`
- Protected routes prevent unauthorized access

✅ **User Dashboards**
- Student: View enrolled courses, track progress
- Teacher: Manage courses, view student enrollment

✅ **Responsive Design**
- Built with Tailwind CSS
- Mobile-friendly interface
- Dark mode support

## 📝 API Endpoints Ready

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

## 🚀 Next Steps (Future Features)

1. **Course Management**
   - Teachers can create/edit/delete courses
   - Course categories and descriptions

2. **Lesson Management**
   - Add lessons to courses
   - Video upload and streaming

3. **Student Enrollment**
   - Students can enroll in courses
   - Automatic progress tracking

4. **Assignments & Quizzes**
   - Create assignments
   - Track grades and scores

5. **Discussion Forums**
   - Course discussions
   - Q&A sections

6. **Notifications**
   - Email notifications
   - In-app notifications

## 🐛 Common Issues

**"Cannot POST /api/auth/register"**
- ✅ Ensure Laravel server is running (`php artisan serve`)
- ✅ Check backend URL in AuthContext.jsx

**"Unexpected end of JSON"**
- ✅ Database might not be set up properly
- ✅ Run `php artisan migrate`

**"Connection refused"**
- ✅ Start MySQL server in XAMPP Control Panel
- ✅ Check .env file database credentials

## 📚 Learn More

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)

## 💡 Tips

- Always keep both backend and frontend servers running
- Check browser console (F12) for errors
- Check Laravel logs at `backend/storage/logs/laravel.log`
- Use Postman to test API endpoints directly

---

**You're all set! Happy coding! 🎉**
