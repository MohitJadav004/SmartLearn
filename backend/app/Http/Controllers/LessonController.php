<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * Get all lessons for a chapter
     */
    public function index(Chapter $chapter, Request $request)
    {
        // Eager load chapter relationship if needed
        $lessons = $chapter->lessons()->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }

    /**
     * Create a new lesson (video or document)
     */
    public function store(Chapter $chapter, Request $request)
    {
        try {
            // Verify chapter belongs to user's course
            $course = $chapter->course;
            if (!$course || $course->teacher_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to add lessons to this chapter',
                ], 403);
            }

            $validated = $request->validate([
                'type' => 'required|in:video,document',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'content_url' => 'nullable|string', // For video URLs only
                'file' => 'nullable|file|mimes:pdf|max:51200', // 50MB max, PDF only
                'file_name' => 'nullable|string',
                'duration' => 'nullable|integer', // for videos
            ]);

            // Additional validation
            if ($validated['type'] === 'video' && empty($validated['content_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'A video URL is required for video lessons',
                ], 422);
            }

            if ($validated['type'] === 'document' && !$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'A PDF file is required for document lessons',
                ], 422);
            }

            $contentUrl = $validated['content_url'] ?? '';

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('lessons', $fileName, 'public');
                $contentUrl = asset('storage/' . $path);
            }

            $lesson = Lesson::create([
                'chapter_id' => $chapter->id,
                'type' => $validated['type'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? '',
                'content_url' => $contentUrl,
                'file_name' => $validated['file_name'] ?? $request->file('file')?->getClientOriginalName() ?? null,
                'duration' => $validated['duration'] ?? null,
                'order' => Lesson::where('chapter_id', $chapter->id)->count(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lesson created successfully',
                'data' => $lesson,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Lesson creation error: ' . $e->getMessage(), [
                'chapter_id' => $chapter->id,
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific lesson
     */
    public function show(Chapter $chapter, Lesson $lesson, Request $request)
    {
        if ($lesson->chapter_id !== $chapter->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $lesson,
        ]);
    }

    public function update(Chapter $chapter, Lesson $lesson, Request $request)
    {
        if ($lesson->chapter_id !== $chapter->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $course = $chapter->course;
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'content_url' => 'string',
            'duration' => 'nullable|integer',
        ]);

        try {
            $lesson->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Lesson updated successfully',
                'data' => $lesson,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lesson',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a lesson
     */
    public function destroy(Chapter $chapter, Lesson $lesson, Request $request)
    {
        if ($lesson->chapter_id !== $chapter->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $course = $chapter->course;
        if ($course->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $lesson->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lesson deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lesson',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
