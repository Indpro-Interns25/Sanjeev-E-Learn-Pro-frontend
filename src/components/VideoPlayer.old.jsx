import { useState, useRef, useEffect } from 'react';
import { Card, Button, ButtonGroup, Spinner, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../styles/video-player.css';

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

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    
    video.src = videoUrl;
    setLoading(false);
    setError(null);
    
    if (autoPlay) {
      video.play().catch(() => {
        setError('Autoplay failed. Please click play to start the video.');
      });
    }
    
    return () => {
      if (video.src) {
        video.src = '';
      }
    };
  }, [videoUrl, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      setError('Failed to load video. Please try again.');
      setLoading(false);
      console.error('Video error:', e);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [onProgress]);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [autoPlay]);

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
    if (!video || isLive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
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

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Card className="video-player-container">
      <div 
        ref={containerRef}
        className={`position-relative bg-black ${isFullscreen ? 'fullscreen-video' : ''}`}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={{ aspectRatio: '16/9', minHeight: '400px' }}
      >
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <Spinner animation="border" variant="light" />
            <div className="text-light mt-2">Loading video...</div>
          </div>
        )}

        {error && (
          <div className="position-absolute top-50 start-50 translate-middle w-75">
            <Alert variant="danger" className="text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-100 h-100"
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          poster={`https://via.placeholder.com/1280x720/000000/FFFFFF?text=${encodeURIComponent(title || 'Video')}`}
          preload="metadata"
          crossOrigin="anonymous"
          playsInline
        >
          Your browser does not support the video tag.
        </video>

        {/* Video Controls Overlay */}
        <div 
          className={`position-absolute bottom-0 start-0 end-0 bg-gradient-dark p-3 transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            transition: 'opacity 0.3s ease'
          }}
        >
          {/* Progress Bar */}
          {!isLive && (
            <div className="mb-2">
              <div 
                className="progress bg-secondary" 
                style={{ height: '4px', cursor: 'pointer' }}
                onClick={handleSeek}
              >
                <div 
                  className="progress-bar bg-primary"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              {/* Play/Pause */}
              <Button 
                variant="link" 
                className="text-white p-1"
                onClick={togglePlay}
              >
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} fs-4`}></i>
              </Button>

              {/* Live Indicator */}
              {isLive && (
                <div className="d-flex align-items-center">
                  <div 
                    className="bg-danger rounded-circle me-2" 
                    style={{ width: '8px', height: '8px' }}
                  ></div>
                  <small className="text-white fw-bold">LIVE</small>
                </div>
              )}

              {/* Time Display */}
              {!isLive && (
                <small className="text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </small>
              )}

              {/* Volume Control */}
              <div className="d-flex align-items-center gap-2">
                <Button 
                  variant="link" 
                  className="text-white p-1"
                  onClick={() => handleVolumeChange({ target: { value: volume > 0 ? 0 : 1 } })}
                >
                  <i className={`bi ${volume > 0 ? 'bi-volume-up' : 'bi-volume-mute'}`}></i>
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="form-range"
                  style={{ width: '80px' }}
                />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Playback Speed */}
              {!isLive && (
                <ButtonGroup size="sm">
                  <Button 
                    variant={playbackSpeed === 0.75 ? 'primary' : 'outline-secondary'}
                    className="text-white"
                    onClick={() => handleSpeedChange(0.75)}
                  >
                    0.75x
                  </Button>
                  <Button 
                    variant={playbackSpeed === 1 ? 'primary' : 'outline-secondary'}
                    className="text-white"
                    onClick={() => handleSpeedChange(1)}
                  >
                    1x
                  </Button>
                  <Button 
                    variant={playbackSpeed === 1.25 ? 'primary' : 'outline-secondary'}
                    className="text-white"
                    onClick={() => handleSpeedChange(1.25)}
                  >
                    1.25x
                  </Button>
                  <Button 
                    variant={playbackSpeed === 1.5 ? 'primary' : 'outline-secondary'}
                    className="text-white"
                    onClick={() => handleSpeedChange(1.5)}
                  >
                    1.5x
                  </Button>
                </ButtonGroup>
              )}

              {/* Fullscreen */}
              <Button 
                variant="link" 
                className="text-white p-1"
                onClick={toggleFullscreen}
              >
                <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string,
  liveStreamUrl: PropTypes.string,
  title: PropTypes.string,
  onProgress: PropTypes.func,
  autoPlay: PropTypes.bool,
  isLive: PropTypes.bool
};