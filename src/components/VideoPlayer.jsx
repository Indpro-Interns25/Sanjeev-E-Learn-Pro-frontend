import { useState, useRef, useEffect } from 'react';
import { Card, Button, ButtonGroup, Spinner, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../styles/video-player.css';

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Helper function to check if URL is YouTube
const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

export default function VideoPlayer({ 
  videoUrl, 
  title, 
  onProgress, 
  autoPlay = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Check if this is a YouTube URL
  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  // Initialize video player
  useEffect(() => {
    if (isYouTube) {
      // For YouTube videos, we'll use iframe embed
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video || !videoUrl) {
      setLoading(false);
      return;
    }
    
    video.src = videoUrl;
    setError(null);
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      
      setCurrentTime(current);
      
      if (onProgress && total > 0) {
        const progress = (current / total) * 100;
        onProgress(progress);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError('Failed to load video. Please try again.');
      setLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    if (autoPlay) {
      video.play().catch(() => {
        setError('Autoplay failed. Please click play to start the video.');
      });
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      if (video.src) {
        video.src = '';
      }
    };
  }, [videoUrl, autoPlay, onProgress, isYouTube]);

  // Auto-hide controls (only for direct video, not YouTube)
  useEffect(() => {
    if (!isYouTube && showControls && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, isYouTube]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    setIsFullscreen(isCurrentlyFullscreen);
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </Alert>
    );
  }

  // Render YouTube iframe
  if (isYouTube && youtubeVideoId) {
    return (
      <Card className="video-player-container">
        {title && (
          <Card.Header className="bg-dark text-light">
            <h6 className="mb-0">{title}</h6>
          </Card.Header>
        )}
        <div 
          ref={containerRef}
          className={`youtube-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&controls=1&showinfo=0`}
            title={title || 'Educational Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="youtube-iframe"
            style={{
              width: '100%',
              height: '400px',
              minHeight: '300px'
            }}
          />
        </div>
      </Card>
    );
  }

  // Render direct video player for non-YouTube URLs
  return (
    <Card className="video-player-container">
      <div 
        ref={containerRef}
        className={`video-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="video-element"
          onClick={showControlsTemporarily}
          playsInline
          preload="metadata"
        />
        
        {loading && (
          <div className="video-loading-overlay">
            <Spinner animation="border" variant="light" />
            <div className="mt-2">Loading video...</div>
          </div>
        )}
        
        {/* Video Controls */}
        <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
          {/* Progress bar */}
          <div className="progress-container mb-2">
            <div 
              className="progress-bar-custom"
              onClick={handleSeek}
            >
              <div 
                className="progress-fill"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          {/* Control buttons */}
          <div className="controls-row">
            <div className="controls-left">
              <Button
                variant="link"
                className="control-btn"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
              </Button>
              
              <div className="volume-controls">
                <Button
                  variant="link"
                  className="control-btn"
                  onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
                  title={volume > 0 ? 'Mute' : 'Unmute'}
                >
                  <i className={`bi ${volume === 0 ? 'bi-volume-mute' : volume < 0.5 ? 'bi-volume-down' : 'bi-volume-up'}`}></i>
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="volume-slider"
                />
              </div>
              
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="controls-right">
              <ButtonGroup size="sm" className="me-2">
                <Button
                  variant={playbackSpeed === 0.5 ? "primary" : "outline-light"}
                  onClick={() => handleSpeedChange(0.5)}
                  className="speed-btn"
                >
                  0.5x
                </Button>
                <Button
                  variant={playbackSpeed === 1 ? "primary" : "outline-light"}
                  onClick={() => handleSpeedChange(1)}
                  className="speed-btn"
                >
                  1x
                </Button>
                <Button
                  variant={playbackSpeed === 1.25 ? "primary" : "outline-light"}
                  onClick={() => handleSpeedChange(1.25)}
                  className="speed-btn"
                >
                  1.25x
                </Button>
                <Button
                  variant={playbackSpeed === 1.5 ? "primary" : "outline-light"}
                  onClick={() => handleSpeedChange(1.5)}
                  className="speed-btn"
                >
                  1.5x
                </Button>
                <Button
                  variant={playbackSpeed === 2 ? "primary" : "outline-light"}
                  onClick={() => handleSpeedChange(2)}
                  className="speed-btn"
                >
                  2x
                </Button>
              </ButtonGroup>
              
              <Button
                variant="link"
                className="control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {title && (
        <Card.Header className="bg-dark text-light">
          <h6 className="mb-0">{title}</h6>
        </Card.Header>
      )}
    </Card>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
  onProgress: PropTypes.func,
  autoPlay: PropTypes.bool
};