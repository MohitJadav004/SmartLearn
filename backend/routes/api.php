<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public route for getting published courses
Route::get('/courses/published', [CourseController::class, 'published']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Course routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

    // Enrollment routes
    Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'enroll']);
    Route::delete('/courses/{course}/unenroll', [EnrollmentController::class, 'unenroll']);
    Route::get('/enrollments/my-courses', [EnrollmentController::class, 'myEnrollments']);
    Route::get('/courses/{course}/check-enrollment', [EnrollmentController::class, 'checkEnrollment']);
    Route::get('/courses/{course}/students', [EnrollmentController::class, 'courseEnrollments']);

    // Chapter routes
    Route::get('/courses/{course}/chapters', [ChapterController::class, 'index']);
    Route::post('/courses/{course}/chapters', [ChapterController::class, 'store']);
    Route::get('/courses/{course}/chapters/{chapter}', [ChapterController::class, 'show']);
    Route::put('/courses/{course}/chapters/{chapter}', [ChapterController::class, 'update']);
    Route::delete('/courses/{course}/chapters/{chapter}', [ChapterController::class, 'destroy']);

    // Lesson routes
    Route::get('/chapters/{chapter}/lessons', [LessonController::class, 'index']);
    Route::post('/chapters/{chapter}/lessons', [LessonController::class, 'store']);
    Route::get('/chapters/{chapter}/lessons/{lesson}', [LessonController::class, 'show']);
    Route::put('/chapters/{chapter}/lessons/{lesson}', [LessonController::class, 'update']);
    Route::delete('/chapters/{chapter}/lessons/{lesson}', [LessonController::class, 'destroy']);
});
