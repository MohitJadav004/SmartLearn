<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'type',
        'title',
        'description',
        'content_url',
        'file_name',
        'duration',
        'order',
    ];

    /**
     * Get the chapter that owns the lesson.
     */
    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
