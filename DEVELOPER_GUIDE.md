# Developer Guide - SmartLearn

This guide helps developers understand the codebase and contribute to SmartLearn.

---

## 📚 Project Overview

SmartLearn is a learning management system with:
- **Backend**: Laravel 12 REST API with token authentication
- **Frontend**: React 19 SPA with role-based routing
- **Database**: MySQL for persistent data storage
- **Authentication**: Laravel Sanctum for stateless token-based auth

---

## 🏗️ Architecture Overview

### Request/Response Flow

```
1. User interacts with React UI
   ↓
2. AuthContext manages authentication state
   ↓
3. Axios sends HTTP request with Bearer token
   ↓
4. Laravel routes request to appropriate controller
   ↓
5. Middleware verifies Sanctum token
   ↓
6. Controller executes business logic
   ↓
7. Response returned as JSON
   ↓
8. Frontend updates UI based on response
```

### Component Hierarchy

```
App
├── AuthProvider
│   ├── Router
│   │   ├── Public Routes
│   │   │   ├── /login → Login.jsx
│   │   │   └── /register → Register.jsx
│   │   ├── Protected Routes
│   │   │   ├── /student-dashboard → StudentDashboard.jsx
│   │   │   │   └── ProtectedRoute (requiredRole="student")
│   │   │   └── /teacher-dashboard → TeacherDashboard.jsx
│   │   │       └── ProtectedRoute (requiredRole="teacher")
│   │   └── Redirect Routes
│   │       └── / → /login
│   │       └── * → /login
```

---

## 🔑 Key Concepts

### Authentication Flow

1. **Registration**
   - User provides: name, email, password, role
   - Password hashed with bcrypt
   - User stored in database
   - Token generated (Sanctum)
   - Token returned to frontend

2. **Login**
   - User provides: email, password
   - Credentials validated against database
   - Token generated
   - Token returned to frontend

3. **Protected Requests**
   - Token included in `Authorization: Bearer {token}` header
   - Middleware validates token
   - User data extracted from token
   - Request processed

4. **Token Storage**
   - Token stored in localStorage
   - Persists across page reloads
   - Automatically attached to requests

### Role-Based Access Control (RBAC)

```
Roles:
├── Student
│   ├── Access: Student Dashboard
│   ├── Can: View courses, track progress
│   └── Cannot: Create courses
│
└── Teacher
    ├── Access: Teacher Dashboard
    ├── Can: Create/edit courses, view students
    └── Cannot: Enroll in courses
```

---

## 📂 Backend Structure

### Controllers

**Location**: `backend/app/Http/Controllers/AuthController.php`

```php
class AuthController {
    public function register(Request $request)      // Create new user
    public function login(Request $request)         // Authenticate user
    public function me(Request $request)            // Get current user
    public function logout(Request $request)        // Revoke token
}
```

### Models

**Location**: `backend/app/Models/User.php`

```php
class User extends Authenticatable {
    $fillable = ['name', 'email', 'password', 'role']
    $casts = ['role' => 'string', 'password' => 'hashed']
    // Relationships will be added here
}
```

### Routes

**Location**: `backend/routes/api.php`

```php
// Public routes
POST   /auth/register          // Register new user
POST   /auth/login             // Login user

// Protected routes (require token)
GET    /auth/me                // Get current user
POST   /auth/logout            // Logout user
```

### Middleware

**Sanctum Middleware**
- Validates tokens from `Authorization` header
- Sets authenticated user in request
- Automatically applied to protected routes

---

## 🎨 Frontend Structure

### Context & Hooks

**Location**: `frontend/src/context/AuthContext.jsx`

```jsx
AuthContext
├── state
│   ├── user: {id, name, email, role}
│   ├── token: string
│   ├── loading: boolean
│   └── isAuthenticated: boolean
│
├── methods
│   ├── register(name, email, password, confirmation, role)
│   ├── login(email, password)
│   ├── logout()
│   └── useAuth() // Hook to use context
```

### Pages

**Login** (`frontend/src/pages/Login.jsx`)
- Form validation
- Error handling
- Role-based redirect

**Register** (`frontend/src/pages/Register.jsx`)
- Form validation with confirmation
- Password length check
- Role selection dropdown
- Error display

**StudentDashboard** (`frontend/src/pages/StudentDashboard.jsx`)
- Course list
- Progress tracking
- Statistics

**TeacherDashboard** (`frontend/src/pages/TeacherDashboard.jsx`)
- Course management table
- Student statistics
- Create course button

### Components

**ProtectedRoute** (`frontend/src/components/ProtectedRoute.jsx`)
- Checks authentication status
- Validates user role
- Redirects unauthorized users
- Shows loading state

---

## 🔄 Adding New Features

### Adding a New API Endpoint

1. **Create Controller Method**
   ```php
   // backend/app/Http/Controllers/CourseController.php
   public function store(Request $request) {
       $validated = $request->validate([...]);
       $course = Course::create($validated);
       return response()->json($course, 201);
   }
   ```

2. **Add Route**
   ```php
   // backend/routes/api.php
   Route::middleware('auth:sanctum')->group(function () {
       Route::post('/courses', [CourseController::class, 'store']);
   });
   ```

3. **Test with Postman**
   - Include `Authorization: Bearer {token}` header
   - Send request and verify response

### Adding a New Frontend Page

1. **Create Component**
   ```jsx
   // frontend/src/pages/Courses.jsx
   export const Courses = () => {
       const { user } = useAuth();
       return <div>{/* content */}</div>;
   };
   ```

2. **Add Route**
   ```jsx
   // frontend/src/App.jsx
   <Route path="/courses" element={
       <ProtectedRoute>
           <Courses />
       </ProtectedRoute>
   } />
   ```

3. **Add Navigation**
   ```jsx
   <Link to="/courses">Courses</Link>
   ```

### Adding a New Database Table

1. **Create Migration**
   ```bash
   php artisan make:migration create_courses_table
   ```

2. **Define Schema**
   ```php
   Schema::create('courses', function (Blueprint $table) {
       $table->id();
       $table->string('title');
       $table->text('description');
       $table->foreignId('teacher_id')->constrained('users');
       $table->timestamps();
   });
   ```

3. **Run Migration**
   ```bash
   php artisan migrate
   ```

---

## 🧪 Testing

### Manual Testing

1. **Backend API** (Use Postman/Insomnia)
   ```
   POST http://localhost:8000/api/auth/register
   POST http://localhost:8000/api/auth/login
   GET http://localhost:8000/api/auth/me
   POST http://localhost:8000/api/auth/logout
   ```

2. **Frontend** (Use browser DevTools)
   - Open Console (F12)
   - Check Network tab for API calls
   - Verify localStorage token storage

### Testing Checklist

- [ ] User can register with student role
- [ ] User can register with teacher role
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] Student redirects to student dashboard
- [ ] Teacher redirects to teacher dashboard
- [ ] Token persists on page reload
- [ ] Logout clears token and redirects
- [ ] Protected routes redirect when not authenticated

---

## 🐛 Debugging

### Backend Debugging

1. **Check Logs**
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

2. **Use Tinker**
   ```bash
   php artisan tinker
   > User::all();
   ```

3. **Add Debug Output**
   ```php
   Log::info('User data:', ['user' => $user]);
   dd($variable); // Dump and die
   ```

### Frontend Debugging

1. **Browser DevTools**
   - F12 to open
   - Console tab for errors
   - Network tab for API requests
   - Application tab for localStorage

2. **Debug React**
   ```jsx
   console.log('Component state:', state);
   debugger; // Pause execution
   ```

3. **Check localStorage**
   ```javascript
   console.log(localStorage.getItem('auth_token'));
   ```

---

## 📊 Performance Optimization

### Backend
- Add database indexes on frequently queried columns
- Use eager loading for relationships: `with('user')`
- Cache frequently accessed data
- Implement pagination for large datasets

### Frontend
- Code splitting with React.lazy()
- Memoization with useMemo/useCallback
- Lazy load images
- Minimize bundle size

---

## 🔒 Security Best Practices

### Backend
- ✅ Validate all input
- ✅ Hash passwords with bcrypt
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Sanitize database queries
- ✅ Use CORS whitelist
- ✅ Add CSRF protection

### Frontend
- ✅ Never hardcode sensitive data
- ✅ Validate user input
- ✅ Use HTTPS only
- ✅ Clear token on logout
- ✅ Validate JWT token expiry
- ✅ Implement XSS protection

---

## 📝 Code Style Guide

### PHP (Laravel)
```php
// Use meaningful variable names
$user = User::find($id);

// Use type hints
public function store(Request $request): Response

// Use model methods
$user->courses()->create([...]);

// Avoid magic strings
const ROLE_STUDENT = 'student';
const ROLE_TEACHER = 'teacher';
```

### JavaScript (React)
```jsx
// Use functional components
export const MyComponent = () => { ... }

// Use destructuring
const { user, logout } = useAuth();

// Use arrow functions
const handleClick = () => { ... }

// Use meaningful prop names
<Button onClick={handleSubmit} disabled={isLoading} />
```

---

## 📦 Dependencies Reference

### Backend
- `laravel/sanctum` - Token authentication
- `laravel/framework` - Core framework
- `laravel/tinker` - Interactive shell

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Run all tests
- [ ] Check code for console errors
- [ ] Verify environment variables
- [ ] Review security settings
- [ ] Test all features
- [ ] Optimize assets
- [ ] Setup monitoring

### Backend Deployment
```bash
# Install dependencies
composer install --no-dev

# Migrate database
php artisan migrate --force

# Cache configuration
php artisan config:cache
php artisan route:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy build folder to hosting
```

---

## 📖 Additional Resources

### Learning Materials
- [Laravel Architecture Concepts](https://laravel.com/docs/structure)
- [React Patterns](https://react.dev/reference)
- [RESTful API Design](https://restfulapi.net/)
- [Database Design](https://www.postgresql.org/docs/current/ddl.html)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Editor
- [GitHub](https://github.com/) - Version control
- [ChatGPT](https://chat.openai.com/) - Assistance

---

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

### Commit Message Format
```
type(scope): subject

body

footer
```

Examples:
- `feat(auth): add two-factor authentication`
- `fix(dashboard): resolve loading spinner bug`
- `docs: update README`

---

## 🆘 Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Review code comments
4. Ask in discussion forums
5. Check framework documentation

---

**Happy Coding! 🚀**

For questions or issues, please refer to the main [README.md](./README.md).
