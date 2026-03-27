<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Add progress data for each student
        $studentsWithProgress = $enrollments->items();
        $studentsWithProgress = array_map(function($student) use ($course) {
            // Count total lessons in course
            $totalLessons = $course->chapters()
                ->with('lessons')
                ->get()
                ->sum(function($chapter) {
                    return $chapter->lessons->count();
                });

            // Get all lesson IDs for this course
            $lessonIds = $course->chapters()
                ->with('lessons')
                ->get()
                ->flatMap(function($chapter) {
                    return $chapter->lessons->pluck('id');
                })
                ->toArray();

            // Get completed lessons count from database
            $completedLessonsCount = 0;
            if (!empty($lessonIds)) {
                try {
                    $completedLessonsCount = DB::table('lesson_completions')
                        ->whereIn('lesson_id', $lessonIds)
                        ->where('user_id', $student->id)
                        ->count();
                } catch (\Exception $e) {
                    // Table might not exist yet, default to 0
                    $completedLessonsCount = 0;
                }
            }

            // Add completed lessons count
            $student->completed_lessons_count = $completedLessonsCount;
            $student->total_lessons = $totalLessons;
            
            return $student;
        }, $studentsWithProgress);

        return response()->json([
            'success' => true,
            'data' => $studentsWithProgress,
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

        // Get all lesson IDs for this course
        $lessonIds = $course->chapters()
            ->with('lessons')
            ->get()
            ->flatMap(function($chapter) {
                return $chapter->lessons->pluck('id');
            })
            ->toArray();

        // Delete all lesson completions for this student in this course
        if (!empty($lessonIds)) {
            LessonCompletion::whereIn('lesson_id', $lessonIds)
                ->where('user_id', $student->id)
                ->delete();
        }

        // Delete the enrollment
        $enrollment->delete();

        // Decrement course students count
        $course->decrement('students_count');

        return response()->json([
            'success' => true,
            'message' => 'Successfully unenrolled from the course'
        ]);
    }

    /**
     * Mark a lesson as completed by the student
     */
    public function completeLesson(Request $request, Lesson $lesson)
    {
        try {
            $student = $request->user();
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            // Check if already completed
            $completion = \App\Models\LessonCompletion::where('user_id', $student->id)
                ->where('lesson_id', $lesson->id)
                ->first();
            
            if ($completion) {
                return response()->json([
                    'success' => true,
                    'message' => 'Lesson already marked as completed',
                    'data' => $completion
                ]);
            }
            
            // Create completion record
            $newCompletion = \App\Models\LessonCompletion::create([
                'user_id' => $student->id,
                'lesson_id' => $lesson->id
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Lesson marked as completed',
                'data' => $newCompletion
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in completeLesson:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error marking lesson as completed'
            ], 500);
        }
    }

    /**
     * Get student's progress in a course
     */
    public function getStudentProgress(Request $request, Course $course)
    {
        $student = $request->user();
        
        // Check if student is enrolled
        if (!$student->isEnrolledIn($course)) {
            return response()->json([
                'success' => false,
                'message' => 'Not enrolled in this course'
            ], 403);
        }
        
        // Get total lessons in course
        $totalLessons = $course->chapters()
            ->with('lessons')
            ->get()
            ->sum(function($chapter) {
                return $chapter->lessons->count();
            });

        // Get all lesson IDs for this course
        $lessonIds = $course->chapters()
            ->with('lessons')
            ->get()
            ->flatMap(function($chapter) {
                return $chapter->lessons->pluck('id');
            })
            ->toArray();

        // Get completed lessons
        $completedLessons = 0;
        if (!empty($lessonIds)) {
            $completedLessons = \DB::table('lesson_completions')
                ->whereIn('lesson_id', $lessonIds)
                ->where('user_id', $student->id)
                ->count();
        }
        
        $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_lessons' => $totalLessons,
                'completed_lessons' => $completedLessons,
                'progress_percentage' => $progress
            ]
        ]);
    }
}
