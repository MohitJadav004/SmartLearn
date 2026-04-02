# SmartLearn - Online Learning Platform

> A modern, full-stack online learning platform where teachers can create and manage courses, and students can learn while tracking their progress.

[![PHP 8.2+](https://img.shields.io/badge/PHP-8.2%2B-blueviolet)](https://php.net)
[![Laravel 12](https://img.shields.io/badge/Laravel-12.0-red)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19.2-blue)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com)
[![MySQL 5.7+](https://img.shields.io/badge/MySQL-5.7%2B-blue)](https://mysql.com)

---

## 🎯 Overview

SmartLearn is a comprehensive learning management system (LMS) built with modern technologies. It provides:

- 👥 **User Management** - Registration with role selection (Student/Teacher)
- 🔐 **Secure Authentication** - Token-based authentication with Laravel Sanctum
- 📚 **Course Management** - Teachers can create and manage courses
- 📊 **Progress Tracking** - Students can track their learning progress
- 🎨 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🚀 **RESTful API** - Comprehensive API for all features

---

## ✨ Features

### Current Features (Phase 1)
- ✅ User Registration with Role Selection
- ✅ Secure User Login with Token Generation
- ✅ Role-Based Dashboard Access
- ✅ Student Dashboard with Course Overview
- ✅ Teacher Dashboard with Course Management
- ✅ Protected Routes with Authentication
- ✅ Responsive Mobile-Friendly Design
- ✅ CORS Configuration for API

### Coming Soon (Phase 2+)
- 📝 Course Creation and Management
- 📖 Lesson Management
- 🎥 Video Streaming
- ✍️ Student Enrollment
- 📊 Progress Analytics


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Frontend)                  │
│  React 19 + React Router + Tailwind CSS + Axios        │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST (JSON)
                   │
┌──────────────────▼──────────────────────────────────────┐
│                    API Server (Backend)                  │
│   Laravel 12 + Laravel Sanctum + MySQL                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes Layer (api.php)                           │  │
│  │ - Register: POST /api/auth/register              │  │
│  │ - Login: POST /api/auth/login                    │  │
│  │ - Me: GET /api/auth/me (Protected)               │  │
│  │ - Logout: POST /api/auth/logout (Protected)      │  │
│  └──────────────────────────────────────────────────┘  │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers Layer (AuthController)               │  │
│  │ - Business Logic                                 │  │
│  │ - Validation                                     │  │
│  │ - Token Generation                               │  │
│  └──────────────────────────────────────────────────┘  │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Models Layer (User Model)                        │  │
│  │ - User Entity with Role                          │  │
│  │ - Sanctum Token Support                          │  │
│  └──────────────────────────────────────────────────┘  │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Database (MySQL)                                 │  │
│  │ - Users Table with Role Enum                     │  │
│  │ - Sanctum Tokens                                 │  │
│  │ - Sessions                                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Automated Installation (Recommended)

#### Windows
```bash
# Double-click: install.bat
# OR run in Command Prompt:
install.bat
```

#### Mac/Linux
```bash
chmod +x install.sh
./install.sh
```

### Option 2: Manual Installation

#### Backend Setup
```bash
cd backend
composer install
php artisan key:generate
composer require laravel/sanctum
# Create MySQL database 'smartlearn'
php artisan migrate
php artisan serve
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 📖 Documentation

### Getting Started
- 📘 [QUICK_START.md](./QUICK_START.md) - 5-minute quick start guide
- 📗 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- 📙 [CONFIG_CHECKLIST.md](./CONFIG_CHECKLIST.md) - Configuration verification

### Project Information
- 📕 [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - What has been built

---

## 🔧 Technology Stack

### Backend
- **Framework**: Laravel 12.0
- **Authentication**: Laravel Sanctum 4.0
- **Database**: MySQL 5.7+
- **PHP Version**: 8.2+
- **Server**: PHP Built-in Server (or Apache/Nginx)

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Vite 7.2.4
- **Node Version**: 14+

### Tools & Services
- **Package Manager (Backend)**: Composer
- **Package Manager (Frontend)**: npm
- **Version Control**: Git
- **Database Client**: phpMyAdmin (via XAMPP)

---

## 📁 Project Structure

```
smartlearn1/
├── backend/                         # Laravel API
│   ├── app/Http/Controllers/
│   │   └── AuthController.php       # Authentication logic
│   ├── app/Models/
│   │   └── User.php                 # User model with role
│   ├── routes/
│   │   ├── api.php                  # API routes
│   │   └── web.php                  # Web routes
│   ├── database/migrations/
│   │   └── *_create_users_table.php # Users table schema
│   ├── config/
│   │   └── cors.php                 # CORS configuration
│   ├── .env                         # Environment configuration
│   ├── composer.json                # PHP dependencies
│   └── artisan                      # Laravel CLI
│
├── frontend/                        # React Application
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx   # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── TeacherDashboard.jsx
│   │   ├── App.jsx                  # Main app component
│   │   └── index.css                # Global styles
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # NPM dependencies
│   ├── vite.config.js               # Vite configuration
│   └── index.html                   # HTML entry point
│
├── QUICK_START.md                   # Quick start guide
├── SETUP_GUIDE.md                   # Detailed setup guide
├── CONFIG_CHECKLIST.md              # Configuration checklist
├── BUILD_SUMMARY.md                 # Build summary
├── install.bat                      # Windows installation script
├── install.sh                        # Mac/Linux installation script
└── README.md                        # This file
```

---

## 🔐 Authentication System

### Registration
```
User fills form → Selects role (Student/Teacher) 
  → POST /api/auth/register 
  → Backend creates user with hashed password 
  → Returns JWT token 
  → Frontend stores token 
  → Redirects to appropriate dashboard
```

### Login
```
User enters credentials 
  → POST /api/auth/login 
  → Backend validates credentials 
  → Returns JWT token 
  → Frontend stores token 
  → Redirects to appropriate dashboard
```

### Token Usage
```
Each API request includes:
Authorization: Bearer {token}

Token verified by Laravel Sanctum middleware
User info retrieved from token
Protected routes require valid token
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
  email_verified_at TIMESTAMP NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🌐 API Endpoints

### Authentication Routes (Public)

#### Register User
```http
POST /api/auth/register

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Login User
```http
POST /api/auth/login

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Protected Routes (Requires Authentication Token)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🧪 Testing the Application

### Test User Accounts

Create these accounts to test different roles:

**Teacher Account**
```
Email: teacher@smartlearn.com
Password: password123
Role: Teacher
```

**Student Account**
```
Email: student@smartlearn.com
Password: password123
Role: Student
```

### Test Scenarios

1. **Registration Flow**
   - Navigate to register page
   - Fill in form with new credentials
   - Select role (Student or Teacher)
   - Submit and verify dashboard redirect

2. **Login Flow**
   - Navigate to login page
   - Enter existing credentials
   - Verify correct dashboard appears

3. **Dashboard Access**
   - Student should see courses and progress
   - Teacher should see course management

4. **Logout**
   - Click logout button
   - Verify redirect to login page
   - Verify token is cleared

---

## 🛠️ Development Commands

### Backend Commands

```bash
cd backend

# Serve application
php artisan serve

# Run migrations
php artisan migrate

# Create new controller
php artisan make:controller YourController

# Create new model
php artisan make:model YourModel

# Run tests
php artisan test

# Clear cache
php artisan cache:clear

# View all routes
php artisan route:list
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Port 8000 already in use** | `php artisan serve --port=8001` |
| **Port 5173 already in use** | `npm run dev -- --port 3000` |
| **Database connection error** | Check MySQL is running, verify .env credentials |
| **CORS error** | Check cors.php config, ensure frontend URL is allowed |
| **Token not persisting** | Check localStorage in browser DevTools |
| **Dashboard not loading** | Check network requests in DevTools |
| **Tailwind styles not loading** | Run `npm install`, verify tailwind.config.js |

### Debug Mode

Enable debug in `.env`:
```env
APP_DEBUG=true
```

View logs:
```bash
tail -f backend/storage/logs/laravel.log
```

Check Network Requests:
- Open browser DevTools (F12)
- Go to Network tab
- Observe API requests and responses

---

## 📚 Additional Resources

### Official Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [React Router Documentation](https://reactrouter.com/)

### Learning Resources
- [Laravel Tutorial](https://laravel.com/docs/getting-started)
- [React Tutorial](https://react.dev/learn)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/installation)
- [REST API Best Practices](https://restfulapi.net/)

---

## 🚀 Deployment

### Hosting Options

**Backend (Laravel)**
- Heroku
- AWS EC2 / Lightsail
- DigitalOcean
- Linode
- Netlify Functions

**Frontend (React)**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Error logging set up
- [ ] Static files optimized
- [ ] Database backups configured
- [ ] SSL certificates installed

---

## 📝 Development Roadmap

### Phase 1 (Current) ✅
- User authentication and registration
- Role-based dashboards
- Basic UI framework

### Phase 2 (Next)
- Course management (Create, Read, Update, Delete)
- Course categories
- Course descriptions and images

### Phase 3
- Student enrollment system
- Progress tracking
- Lesson management

### Phase 4
- Video streaming
- Assignment system
- Quiz functionality

### Phase 5
- Analytics and reporting
- Certificates
- Payment integration

### Phase 6
- Discussion forums
- Real-time notifications
- Advanced search and filtering

---

## 👥 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support & Contact

For issues, questions, or suggestions:

1. Check the [QUICK_START.md](./QUICK_START.md)
2. Review [CONFIG_CHECKLIST.md](./CONFIG_CHECKLIST.md)
3. Check browser console and Laravel logs
4. Open an issue in the repository

---

## 🙏 Acknowledgments

- Laravel community for excellent framework
- React team for amazing frontend library
- Tailwind Labs for beautiful CSS framework
- All contributors and users

---

## 📊 Project Stats

- **Backend Files**: 15+ files
- **Frontend Components**: 7 components
- **API Endpoints**: 4 endpoints (expandable)
- **Database Tables**: 6+ tables
- **Development Time**: 2-3 hours
- **Setup Time**: 10-15 minutes

---

**Ready to build something amazing?** Start with [QUICK_START.md](./QUICK_START.md)

**Last Updated**: January 27, 2026  
**Version**: 1.0-alpha  
**Status**: ✅ Ready for Development
