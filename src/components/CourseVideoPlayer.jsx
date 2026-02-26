/**
 * CourseVideoPlayer.jsx
 * Fully custom HTML5 video player with:
 * – Play/Pause, scrubber, volume, playback speed, fullscreen
 * – Resume from saved timestamp (startTime prop)
 * – onTimeUpdate callback every ~5 s for progress saving
 * – Auto-marks lecture complete via onEnded callback
 * – Keyboard shortcuts: Space (play/pause), ← / → seek, ↑ / ↓ volume, F fullscreen
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function CourseVideoPlayer({
  src,
  title = '',
  startTime = 0,
  onTimeUpdate,   // (currentTime) => void – called every ~5 s
  onEnded,        // () => void
  onError,        // (errorMsg) => void
}) {
  const videoRef       = useRef(null);
  const containerRef   = useRef(null);
  const controlsTimer  = useRef(null);

  const [playing, setPlaying]       = useState(false);
  const [currentTime, setCurrent]   = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volume, setVolume]         = useState(1);
  const [muted, setMuted]           = useState(false);
  const [speed, setSpeed]           = useState(1);
  const [buffered, setBuffered]     = useState(0);
  const [isFullscreen, setFS]       = useState(false);
  const [showControls, setShow]     = useState(true);
  const [loading, setLoading]       = useState(true);
  const [errMsg, setErrMsg]         = useState(null);
  const [showSpeedMenu, setSpeedMenu] = useState(false);

  const lastSavedRef = useRef(0);

  // ── Initialise on src change ─────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setBuffered(0);
    setLoading(true);
    setErrMsg(null);
    lastSavedRef.current = 0;
  }, [src]);

  // ── Event listeners ──────────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoadedMetadata = () => {
      setDuration(v.duration);
      setLoading(false);
      if (startTime > 0 && startTime < v.duration - 3) {
        v.currentTime = startTime;
      }
    };
    const onTimeUpdateEvt = () => {
      setCurrent(v.currentTime);
      // Fire onTimeUpdate every 5 s
      if (v.currentTime - lastSavedRef.current >= 5) {
        lastSavedRef.current = v.currentTime;
        onTimeUpdate?.(v.currentTime);
      }
      // Buffered
      if (v.buffered.length > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEndedEvt = () => {
      setPlaying(false);
      onTimeUpdate?.(v.duration);
      onEnded?.();
    };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onErrorEvt = () => {
      const msg = 'Video could not be loaded. Please check the source URL.';
      setErrMsg(msg);
      setLoading(false);
      onError?.(msg);
    };
    const onFSChange = () => setFS(Boolean(document.fullscreenElement));

    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('timeupdate', onTimeUpdateEvt);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEndedEvt);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('error', onErrorEvt);
    document.addEventListener('fullscreenchange', onFSChange);

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('timeupdate', onTimeUpdateEvt);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEndedEvt);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('error', onErrorEvt);
      document.removeEventListener('fullscreenchange', onFSChange);
    };
  }, [src, startTime, onTimeUpdate, onEnded, onError]);

  // ── Controls show/hide on mouse move ────────────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShow(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShow(false);
    }, 3000);
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (!containerRef.current?.contains(document.activeElement) &&
          document.activeElement !== document.body) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case 'ArrowRight':
          v.currentTime = Math.min(v.currentTime + 5, v.duration);
          break;
        case 'ArrowLeft':
          v.currentTime = Math.max(v.currentTime - 5, 0);
          break;
        case 'ArrowUp':
          v.volume = Math.min(v.volume + 0.1, 1);
          setVolume(v.volume);
          break;
        case 'ArrowDown':
          v.volume = Math.max(v.volume - 0.1, 0);
          setVolume(v.volume);
          break;
        case 'KeyF':
          toggleFS();
          break;
        case 'KeyM':
          v.muted = !v.muted;
          setMuted(v.muted);
          break;
        default: break;
      }
      showControlsTemporarily();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showControlsTemporarily]); // eslint-disable-line

  // ── Control actions ──────────────────────────────────────────────────────────
  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
    showControlsTemporarily();
  }

  function handleScrub(e) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
    setCurrent(v.currentTime);
  }

  function handleVolume(e) {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted  = val === 0;
    setVolume(val);
    setMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeSpeed(s) {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
    setSpeedMenu(false);
  }

  function toggleFS() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function skip(secs) {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.currentTime + secs, duration));
  }

  const progressPct  = duration ? (currentTime / duration) * 100 : 0;
  const volumeIcon   = muted || volume === 0 ? 'bi-volume-mute-fill'
                     : volume < 0.5           ? 'bi-volume-down-fill'
                                              : 'bi-volume-up-fill';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="position-relative bg-black w-100 overflow-hidden rounded-3"
      style={{ aspectRatio: '16/9', outline: 'none' }}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => { if (playing) setShow(false); }}
      onClick={togglePlay}
      onDoubleClick={toggleFS}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src || undefined}
        className="w-100 h-100"
        style={{ objectFit: 'contain', display: 'block' }}
        playsInline
        preload="metadata"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => { e.stopPropagation(); toggleFS(); }}
      />

      {/* Loading spinner */}
      {loading && !errMsg && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div
            className="rounded-circle border-4 border-white border-opacity-30"
            style={{
              width: 56, height: 56,
              border: '4px solid rgba(255,255,255,0.25)',
              borderTopColor: '#fff',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {/* Error overlay */}
      {errMsg && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white text-center px-4">
          <i className="bi bi-exclamation-circle" style={{ fontSize: '2.5rem', color: '#ef4444' }} />
          <p className="mt-2 mb-0 small">{errMsg}</p>
        </div>
      )}

      {/* Centre play/pause indicator */}
      {!playing && !loading && !errMsg && (
        <div
          className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 72, height: 72,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        >
          <i className="bi bi-play-fill text-white" style={{ fontSize: '2rem', marginLeft: 4 }} />
        </div>
      )}

      {/* Controls bar */}
      <div
        className="position-absolute bottom-0 start-0 w-100 px-3 pb-2 pt-5"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          transition: 'opacity 0.3s',
          opacity: showControls || !playing ? 1 : 0,
          pointerEvents: showControls || !playing ? 'auto' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && (
          <p className="text-white small fw-semibold mb-2 text-truncate opacity-75"
            style={{ fontSize: '0.78rem', letterSpacing: '0.02em' }}>
            {title}
          </p>
        )}

        {/* Scrubber */}
        <div
          className="w-100 mb-2 position-relative"
          style={{ height: 14, cursor: 'pointer' }}
          onClick={handleScrub}
        >
          {/* Buffered track */}
          <div
            className="position-absolute top-50 start-0 rounded-pill"
            style={{
              height: 4,
              width: `${buffered}%`,
              background: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Progress track */}
          <div
            className="position-absolute top-50 start-0 rounded-pill"
            style={{
              height: 4,
              width: `${progressPct}%`,
              background: '#6366f1',
              transform: 'translateY(-50%)',
              transition: 'width 0.1s linear',
            }}
          />
          {/* Background track */}
          <div
            className="position-absolute top-50 start-0 w-100 rounded-pill"
            style={{ height: 4, background: 'rgba(255,255,255,0.15)', transform: 'translateY(-50%)' }}
          />
          {/* Thumb */}
          <div
            className="position-absolute top-50 rounded-circle bg-white"
            style={{
              width: 12, height: 12,
              left: `calc(${progressPct}% - 6px)`,
              transform: 'translateY(-50%)',
              boxShadow: '0 0 4px rgba(0,0,0,0.5)',
              transition: 'left 0.1s linear',
            }}
          />
        </div>

        {/* Bottom row */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Play / Pause */}
          <button className="btn p-0 text-white" onClick={togglePlay} title={playing ? 'Pause (Space)' : 'Play (Space)'}>
            <i className={`bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: '1.3rem' }} />
          </button>

          {/* Skip -10 / +10 */}
          <button className="btn p-0 text-white d-none d-sm-block" onClick={() => skip(-10)} title="-10s (←)">
            <i className="bi bi-skip-backward-fill" style={{ fontSize: '1rem' }} />
          </button>
          <button className="btn p-0 text-white d-none d-sm-block" onClick={() => skip(10)} title="+10s (→)">
            <i className="bi bi-skip-forward-fill" style={{ fontSize: '1rem' }} />
          </button>

          {/* Volume */}
          <button className="btn p-0 text-white" onClick={toggleMute} title="Mute (M)">
            <i className={`bi ${volumeIcon}`} style={{ fontSize: '1rem' }} />
          </button>
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="d-none d-sm-block"
            style={{ width: 70, accentColor: '#6366f1', cursor: 'pointer' }}
            title="Volume (↑↓)"
          />

          {/* Time */}
          <span className="text-white small ms-1 flex-shrink-0" style={{ fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-grow-1" />

          {/* Playback speed */}
          <div className="position-relative">
            <button
              className="btn btn-sm text-white px-2 py-0 rounded"
              style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.15)', border: 'none' }}
              onClick={(e) => { e.stopPropagation(); setSpeedMenu((v) => !v); }}
              title="Playback speed"
            >
              {speed}×
            </button>
            {showSpeedMenu && (
              <div
                className="position-absolute bg-dark rounded-3 overflow-hidden"
                style={{ bottom: '2rem', right: 0, zIndex: 20, minWidth: 80, boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
              >
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm w-100 text-start px-3 py-1 border-0 ${speed === s ? 'text-primary fw-bold' : 'text-white'}`}
                    style={{ fontSize: '0.8rem', background: 'transparent' }}
                    onClick={() => changeSpeed(s)}
                  >
                    {s === 1 ? 'Normal' : `${s}×`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button className="btn p-0 text-white" onClick={toggleFS} title="Fullscreen (F)">
            <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`} style={{ fontSize: '1rem' }} />
          </button>
        </div>
      </div>

      {/* CSS spinner keyframe injected inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
