const playButton = document.querySelector('.play-btn');
const statusText = document.getElementById('player-status');
const timeReadout = document.getElementById('time-readout');
const progressBar = document.getElementById('progress');

const VIDEO_ID = 'pxPbZ-dogT8';
let ytPlayer;
let progressTimer;
let seeking = false;

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimeline() {
  if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') {
    return;
  }

  const duration = ytPlayer.getDuration() || 0;
  const currentTime = ytPlayer.getCurrentTime() || 0;

  timeReadout.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;

  if (!seeking && duration > 0) {
    progressBar.value = (currentTime / duration) * 100;
  }
}

function setPlayingUI(isPlaying) {
  playButton.classList.toggle('is-playing', isPlaying);
  statusText.textContent = isPlaying ? 'PLAYING' : 'PAUSADO';
}

function onPlayerReady() {
  statusText.textContent = 'TAP PLAY';
  updateTimeline();
  progressTimer = window.setInterval(updateTimeline, 500);
}

function onPlayerStateChange(event) {
  const state = event.data;
  const isPlaying = state === window.YT.PlayerState.PLAYING;

  setPlayingUI(isPlaying);

  if (state === window.YT.PlayerState.ENDED) {
    ytPlayer.seekTo(0);
    ytPlayer.playVideo();
  }
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  ytPlayer = new window.YT.Player('yt-player', {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      loop: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      playlist: VIDEO_ID,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function togglePlayback() {
  if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') {
    return;
  }

  const state = ytPlayer.getPlayerState();
  if (state === window.YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

playButton.addEventListener('click', togglePlayback);

progressBar.addEventListener('pointerdown', () => {
  seeking = true;
});

progressBar.addEventListener('pointerup', () => {
  seeking = false;
});

progressBar.addEventListener('input', () => {
  if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') {
    return;
  }

  const duration = ytPlayer.getDuration() || 0;
  if (duration > 0) {
    const newTime = (Number(progressBar.value) / 100) * duration;
    ytPlayer.seekTo(newTime, true);
    updateTimeline();
  }
});

const youtubeApiScript = document.createElement('script');
youtubeApiScript.src = 'https://www.youtube.com/iframe_api';
youtubeApiScript.async = true;
document.body.appendChild(youtubeApiScript);

window.addEventListener('beforeunload', () => {
  if (progressTimer) {
    window.clearInterval(progressTimer);
  }
});
