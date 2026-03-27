import React from 'react';

const VideoPlayer = ({ videoUrl, title }) => {
  if (!videoUrl) {
    return (
      <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 flex items-center justify-center border border-slate-700">
        <p className="text-slate-400 text-center text-sm">No video available</p>
      </div>
    );
  }

  // Extract YouTube ID
  const extractYoutubeId = (url) => {
    if (!url) return null;
    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ];
    
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const youtubeId = extractYoutubeId(videoUrl);

  // Check if it's a YouTube URL - use nocookie domain and minimal controls
  if (youtubeId) {
    return (
      <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 border border-slate-700 shadow-xl">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?modestbranding=1&rel=0&controls=1&fs=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 'none' }}
        ></iframe>
      </div>
    );
  }

  // For direct video URLs (mp4, webm, etc.) - use HTML5 video player
  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4 border border-slate-700 shadow-xl">
      <video
        width="100%"
        height="100%"
        controls
        controlsList="nodownload"
        className="w-full h-full bg-black"
        title={title}
        style={{ objectFit: 'contain' }}
      >
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
