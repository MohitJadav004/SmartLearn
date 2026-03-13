<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Index for filtering courses by teacher (common query)
            $table->index('teacher_id');
            // Index for status filtering (published courses)
            $table->index('status');
            // Composite index for common teacher + status queries
            $table->index(['teacher_id', 'status']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            // Index for filtering chapters by course
            $table->index('course_id');
            // Composite index for ordering within course
            $table->index(['course_id', 'order']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            // Index for filtering lessons by chapter
            $table->index('chapter_id');
            // Composite index for ordering within chapter
            $table->index(['chapter_id', 'order']);
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Index for token lookups
            $table->index('tokenable_id');
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['teacher_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['teacher_id', 'status']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex(['course_id']);
            $table->dropIndex(['course_id', 'order']);
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropIndex(['chapter_id']);
            $table->dropIndex(['chapter_id', 'order']);
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex(['tokenable_id']);
            $table->dropIndex(['tokenable_type', 'tokenable_id']);
        });
    }
};
