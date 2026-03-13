<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Chapter;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    /**
     * Get all chapters for a course
     */
    public function index(Course $course, Request $request)
    {
        // Verify course belongs to user
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $chapters = $course->chapters()->with('lessons')->get();

        return response()->json([
            'success' => true,
            'data' => $chapters,
        ]);
    }

    /**
     * Create a new chapter
     */
    public function store(Course $course, Request $request)
    {
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $chapter = Chapter::create([
                'course_id' => $course->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'order' => Chapter::where('course_id', $course->id)->count(),
            ]);

            // Increment chapters count
            $course->increment('chapters_count');

            return response()->json([
                'success' => true,
                'message' => 'Chapter created successfully',
                'data' => $chapter,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create chapter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific chapter
     */
    public function show(Course $course, Chapter $chapter, Request $request)
    {
        if ($course->teacher_id !== $request->user()->id || $chapter->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $chapter->load('lessons'),
        ]);
    }

    /**
     * Update a chapter
     */
    public function update(Course $course, Chapter $chapter, Request $request)
    {
        if ($course->teacher_id !== $request->user()->id || $chapter->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $chapter->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Chapter updated successfully',
                'data' => $chapter,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update chapter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a chapter
     */
    public function destroy(Course $course, Chapter $chapter, Request $request)
    {
        if ($course->teacher_id !== $request->user()->id || $chapter->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $chapter->delete();
            
            // Decrement chapters count
            $course->decrement('chapters_count');

            return response()->json([
                'success' => true,
                'message' => 'Chapter deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete chapter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
