# Enrollment System - Testing Guide

## Quick Start

### Backend Setup
1. Database migration already ran: `php artisan migrate`
2. All API endpoints are ready

### Frontend
1. Route `/student-dashboard` - Available courses list
2. Route `/student-course/:courseId` - Course enrollment page
3. Route `/teacher-dashboard` - Teacher course management

## Testing Steps (Manual)

### 1. Student Enrollment
1. Login as student account
2. Go to Student Dashboard (`/student-dashboard`)
3. See list of published courses
4. Click "Enroll Now" on any course
5. You'll be redirected to StudentCourseDetail page
6. Click "Enroll Now" button
7. Should see success message
8. Button changes to "Unenroll"
9. Student count increases by 1

### 2. Teacher Views Students
1. Login as teacher account
2. Go to Teacher Dashboard (`/teacher-dashboard`)
3. See all your courses with student counts
4. Click "View Students (X)" button on any course
5. Modal opens showing:
   - Course name
   - List of all enrolled students
   - Student name and email
   - Enrollment status badge

### 3. Counter Updates
1. Check "Total Students" card on Teacher Dashboard
2. Should sum all students across all courses
3. After student enrolls, count should increase
4. After student unenrolls, count should decrease

### 4. Enrollment Prevention
1. Try enrolling twice in same course
2. Should see error: "You are already enrolled in this course"
3. Enrollment count won't increase

## API Endpoints Testing (curl examples)

### Student Enroll
```
POST /api/courses/{courseId}/enroll
Authorization: Bearer {token}
```

### Student Check Enrollment
```
GET /api/courses/{courseId}/check-enrollment
Authorization: Bearer {token}
```

### Student View My Courses
```
GET /api/enrollments/my-courses
Authorization: Bearer {token}
```

### Teacher View Enrolled Students
```
GET /api/courses/{courseId}/students
Authorization: Bearer {token}
(Only works if you're the teacher of this course)
```

### Student Unenroll
```
DELETE /api/courses/{courseId}/unenroll
Authorization: Bearer {token}
```

## Key Files
- Backend: `app/Http/Controllers/EnrollmentController.php`
- Frontend: `src/pages/StudentCourseDetail.jsx`
- Routes: `routes/api.php`
- Migrations: `database/migrations/2026_03_12_000000_create_enrollments_table.php`

## Expected Behavior

✅ Student can enroll in published courses
✅ Student can view enrolled courses
✅ Student can see enrollment status
✅ Teacher can view enrolled students with names/emails
✅ Enrollment counters update correctly
✅ Duplicate enrollments prevented
✅ Proper error handling with user-friendly messages
✅ Loading states work correctly
✅ Cache invalidation on changes

## Known Features
- Enrolled courses appear in student dashboard (future: "My Courses" section)
- Teachers can see individual students per course
- Real-time counter updates
- Unenroll functionality available
