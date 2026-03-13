<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Enroll a student in a course
     */
    public function enroll(Request $request, Course $course)
    {
        $student = $request->user();

        // Check if student is already enrolled
        if ($student->isEnrolledIn($course)) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course'
            ], 409);
        }

        // Create enrollment
        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        // Increment course students count
        $course->increment('students_count');

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in the course',
            'data' => [
                'enrollment_id' => $enrollment->id,
                'course' => $course->load('teacher')
            ]
        ], 201);
    }

    /**
     * Get student's enrolled courses
     */
    public function myEnrollments(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $student = $request->user();

        $enrollments = $student->enrolledCourses()
            ->with('teacher:id,name,email')
            ->select(['courses.id', 'courses.teacher_id', 'courses.title', 'courses.description', 
                     'courses.status', 'courses.level', 'courses.language', 'courses.students_count', 
                     'courses.chapters_count', 'courses.created_at'])
            ->latest('enrollments.created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $enrollments->items(),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
                'last_page' => $enrollments->lastPage(),
            ]
        ]);
    }

    /**
     * Check if student is enrolled in a course
     */
    public function checkEnrollment(Request $request, Course $course)
    {
        $student = $request->user();
        $isEnrolled = $student->isEnrolledIn($course);

        return response()->json([
            'success' => true,
            'enrolled' => $isEnrolled
        ]);
    }

    /**
     * Get students enrolled in a course (teacher only)
     */
    public function courseEnrollments(Request $request, Course $course)
    {
        // Check if user is the teacher of this course
        if ($request->user()->id !== $course->teacher_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $perPage = $request->input('per_page', 15);

        $enrollments = $course->students()
            ->select(['users.id', 'users.name', 'users.email', 'users.role'])
            ->latest('enrollments.created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $enrollments->items(),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
                'last_page' => $enrollments->lastPage(),
            ]
        ]);
    }

    /**
     * Unenroll a student from a course
     */
    public function unenroll(Request $request, Course $course)
    {
        $student = $request->user();

        // Find and delete enrollment
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this course'
            ], 404);
        }

        $enrollment->delete();

        // Decrement course students count
        $course->decrement('students_count');

        return response()->json([
            'success' => true,
            'message' => 'Successfully unenrolled from the course'
        ]);
    }
}
