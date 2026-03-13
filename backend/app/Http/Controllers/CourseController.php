<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Get all published courses (public)
     */
    public function published(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $courses = Course::with(['teacher:id,name,email'])
            ->where('status', 'Published')
            ->select(['id', 'teacher_id', 'title', 'description', 'status', 'level', 'language', 'students_count', 'chapters_count', 'created_at'])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses->items(),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'last_page' => $courses->lastPage(),
            ]
        ]);
    }

    /**
     * Get all courses for the authenticated teacher
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $courses = Course::with(['chapters', 'teacher'])
            ->where('teacher_id', $request->user()->id)
            ->select(['id', 'teacher_id', 'title', 'description', 'status', 'lessons_count', 'students_count', 'chapters_count', 'created_at', 'updated_at'])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses->items(),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'last_page' => $courses->lastPage(),
            ]
        ]);
    }

    /**
     * Create a new course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'what_you_will_learn' => 'nullable|string',
            'requirements' => 'nullable|string',
            'status' => 'required|in:Draft,Published',
        ]);

        try {
            $course = Course::create([
                'teacher_id' => $request->user()->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'what_you_will_learn' => $validated['what_you_will_learn'],
                'requirements' => $validated['requirements'],
                'status' => $validated['status'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific course
     */
    public function show(Course $course, Request $request)
    {
        // Allow access if user is the teacher OR course is published
        if ($course->teacher_id !== $request->user()->id && $course->status !== 'Published') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Eager load chapters with lessons
        $course->load(['chapters' => function ($query) {
            $query->with('lessons')->orderBy('order');
        }, 'teacher:id,name,email']);

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    /**
     * Update a course
     */
    public function update(Request $request, Course $course)
    {
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'what_you_will_learn' => 'nullable|string',
            'requirements' => 'nullable|string',
            'status' => 'in:Draft,Published',
        ]);

        try {
            $course->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a course
     */
    public function destroy(Course $course, Request $request)
    {
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
