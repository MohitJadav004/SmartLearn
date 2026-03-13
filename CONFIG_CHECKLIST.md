# Configuration Checklist

## Backend Configuration

### ✅ Environment Setup
- [x] `.env` file created with MySQL configuration
  - Database: `smartlearn`
  - Host: `127.0.0.1`
  - Port: `3306`
  - User: `root`
  - Password: (empty by default in XAMPP)

### ✅ Database
- [x] Migrations updated to include `role` field in users table
- [x] Role enum: `student` or `teacher`
- [ ] **TODO**: Create database via phpMyAdmin
- [ ] **TODO**: Run `php artisan migrate`

### ✅ Dependencies
- [x] `composer.json` updated with `laravel/sanctum`
- [ ] **TODO**: Run `composer install` to install Sanctum

### ✅ Controllers
- [x] `AuthController.php` created with:
  - `register()` - Register new users with role
  - `login()` - Authenticate users
  - `me()` - Get current user info
  - `logout()` - Logout user

### ✅ Routes
- [x] `routes/api.php` created with:
  - POST `/auth/register` - Public
  - POST `/auth/login` - Public
  - GET `/auth/me` - Protected
  - POST `/auth/logout` - Protected

### ✅ Configuration
- [x] `config/cors.php` created for cross-origin requests
- [x] `bootstrap/app.php` updated with API routing

### ✅ Model
- [x] `User.php` model updated:
  - `role` added to `$fillable`
  - `role` added to `$casts`

---

## Frontend Configuration

### ✅ Dependencies
- [x] `package.json` updated with:
  - `axios` - HTTP client
  - `react-router-dom` - Client routing
  - `tailwindcss` - Styling
  - `autoprefixer` - PostCSS plugin
  - `@tailwindcss/forms` - Form styling

### ✅ Styling
- [x] `tailwind.config.js` created
- [x] `postcss.config.js` created
- [x] `src/index.css` updated with Tailwind directives

### ✅ Authentication
- [x] `src/context/AuthContext.jsx` created:
  - Auth state management
  - Token storage/retrieval
  - `register()` method
  - `login()` method
  - `logout()` method
  - `useAuth()` hook

### ✅ Pages
- [x] `src/pages/Login.jsx` - Login form
- [x] `src/pages/Register.jsx` - Registration form with role selection
- [x] `src/pages/StudentDashboard.jsx` - Student dashboard
- [x] `src/pages/TeacherDashboard.jsx` - Teacher dashboard

### ✅ Components
- [x] `src/components/ProtectedRoute.jsx` - Route protection component

### ✅ Routing
- [x] `src/App.jsx` updated with:
  - React Router setup
  - AuthProvider wrapper
  - Protected routes for dashboards
  - Public routes for login/register

### ✅ Configuration
- [x] `.env.example` created with API URL

---

## Setup Verification Checklist

Before running the application, verify:

### Backend
- [ ] MySQL is running (XAMPP)
- [ ] Database `smartlearn` is created
- [ ] `backend/.env` is properly configured
- [ ] `composer install` has been run
- [ ] `php artisan key:generate` has been run (if needed)
- [ ] `composer require laravel/sanctum` has been installed
- [ ] `php artisan migrate` has been executed
- [ ] No error messages in terminal when running `php artisan serve`

### Frontend
- [ ] `npm install` has been run in frontend directory
- [ ] No error messages when running `npm run dev`
- [ ] `.env` file exists (optional, using default API URL)
- [ ] Tailwind CSS is being applied (check styling in browser)

---

## Running the Application

### Start Backend
```bash
cd backend
php artisan serve
```
Expected output:
```
INFO  Server running on [http://127.0.0.1:8000].
```

### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
Expected output:
```
  ➜  Local:   http://localhost:5173/
```

### Test the Application
1. Open http://localhost:5173 in browser
2. Should see login page or redirect to login
3. Click "Register here"
4. Fill in form and select role
5. Should redirect to appropriate dashboard

---

## Troubleshooting Commands

### Backend Issues
```bash
# Check PHP version
php --version

# Check Laravel key
php artisan key:generate

# Verify migrations
php artisan migrate:status

# Fresh migrate (warning: clears data)
php artisan migrate:fresh

# Check routes
php artisan route:list
```

### Frontend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check versions
npm list react react-router-dom axios tailwindcss
```

### Database Issues
```bash
# Access MySQL via XAMPP
mysql -u root

# Check database creation
SHOW DATABASES;

# Access SmartLearn database
USE smartlearn;
SHOW TABLES;
DESC users;
```

---

## API Testing (Using Curl or Postman)

### Test Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "student"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Files Modified/Created

### Backend
- ✅ Modified: `database/migrations/0001_01_01_000000_create_users_table.php`
- ✅ Modified: `app/Models/User.php`
- ✅ Modified: `bootstrap/app.php`
- ✅ Modified: `composer.json`
- ✅ Modified: `.env`
- ✅ Created: `app/Http/Controllers/AuthController.php`
- ✅ Created: `routes/api.php`
- ✅ Created: `config/cors.php`

### Frontend
- ✅ Modified: `package.json`
- ✅ Modified: `src/App.jsx`
- ✅ Modified: `src/index.css`
- ✅ Modified: `src/App.css`
- ✅ Created: `tailwind.config.js`
- ✅ Created: `postcss.config.js`
- ✅ Created: `.env.example`
- ✅ Created: `src/context/AuthContext.jsx`
- ✅ Created: `src/pages/Login.jsx`
- ✅ Created: `src/pages/Register.jsx`
- ✅ Created: `src/pages/StudentDashboard.jsx`
- ✅ Created: `src/pages/TeacherDashboard.jsx`
- ✅ Created: `src/components/ProtectedRoute.jsx`

### Root Level
- ✅ Created: `SETUP_GUIDE.md`
- ✅ Created: `QUICK_START.md`
- ✅ Created: `CONFIG_CHECKLIST.md`

---

## Next Phase Implementation

After verifying the above checklist works:

1. **Course Module**
   - Create Course model and migration
   - Course CRUD operations
   - Course listing/filtering

2. **Lesson Module**
   - Create Lesson model
   - Video upload functionality
   - Lesson progress tracking

3. **Enrollment Module**
   - Course enrollment
   - Student-Course relationship
   - Progress calculation

4. **Admin Features**
   - Admin dashboard
   - User management
   - Course moderation

5. **Advanced Features**
   - Quizzes and assessments
   - Certificates
   - Payment integration
   - Analytics

---

**Last Updated**: January 27, 2026
**Status**: ✅ Ready for Initial Setup
