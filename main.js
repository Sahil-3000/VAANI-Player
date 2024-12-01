


// Utility function to detect the image type from the file extension
function detectImageType(url) {
  const extension = url.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'bmp':
      return 'image/bmp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/*'; // Fallback for unknown types
  }
}

function updateMediaMetadata(song) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title.trim(),
      artist: song.artist.trim(),
      artwork: [
        { src: song.cover, sizes: '96x96', type: detectImageType(song.cover) },
        { src: song.cover, sizes: '128x128', type: detectImageType(song.cover) },
        { src: song.cover, sizes: '256x256', type: detectImageType(song.cover) },
        { src: song.cover, sizes: '512x512', type: detectImageType(song.cover) },
      ]
    });
  }
}

navigator.mediaSession.setActionHandler('play', () => {
  // Play the song
  audio.play();
});

navigator.mediaSession.setActionHandler('pause', () => {
  // Pause the song
  audio.pause();
});

navigator.mediaSession.setActionHandler('nexttrack', () => {
  // Play the next song
  nextButton.onclick();
});

navigator.mediaSession.setActionHandler('previoustrack', () => {
  // Play the previous song
  prevButton.onclick();
});

const playlists = [playlist1, playlist2];
let currentPlaylist = playlist1;
let currentSongIndex = 0;
let isPlaying = false;

const songTitleElement = document.getElementById("song-title");
const playPauseButton = document.getElementById("play-pause");
const nextButton = document.getElementById("next");
const prevButton = document.getElementById("prev");
const progressBar = document.getElementById("progress-bar");
const volumeBar = document.getElementById("volume-bar");
const currentTimeElement = document.getElementById("current-time");
const durationElement = document.getElementById("duration");
const playlistElement = document.getElementById("playlist");

const audio = new Audio();

// Load Playlists in the UI
function loadPlaylists() {
  const playlistContainer = document.createElement("div");
  playlistContainer.className = "playlist-buttons";

  playlists.forEach((playlist, index) => {
    const button = document.createElement("button");
    button.textContent = playlist.name;
    button.onclick = () => switchPlaylist(index);
    playlistContainer.appendChild(button);
  });

  document.querySelector(".playlist").prepend(playlistContainer);
}

// Switch Playlist
function switchPlaylist(index) {
  currentPlaylist = playlists[index];
  currentSongIndex = 0; // Reset to the first song of the new playlist
  updatePlaylistUI();
  loadSong(currentSongIndex);
}

// Update Playlist UI
function updatePlaylistUI() {
  playlistElement.innerHTML = ""; // Clear existing songs

  currentPlaylist.songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "song-item";
    li.innerHTML = `
      <img src="${song.cover}" alt="Cover" class="song-cover">
      <div>
        <strong>${song.title.trim()}</strong><br>
        <small>${song.artist.trim()}</small>
      </div>
    `;
    li.onclick = () => loadSong(index);
    playlistElement.appendChild(li);
  });
}

// Load the selected song
function loadSong(index) {
  currentSongIndex = index;
  const song = currentPlaylist.songs[currentSongIndex];
  songTitleElement.textContent = `${song.title.trim()} - ${song.artist.trim()}`;
  audio.src = song.audio; // Use the `audio` property from the song object
  audio.load();
  playSong();
  updateProgress();
  updateMediaMetadata(song);
}

// Play the current song
function playSong() {
  isPlaying = true;
  audio.play();
  playPauseButton.textContent = "⏸";
  updateMediaMetadata(song);
}

// Pause the current song
function pauseSong() {
  isPlaying = false;
  audio.pause();
  playPauseButton.textContent = "▶";
}

// Toggle play/pause
playPauseButton.onclick = () => {
  isPlaying ? pauseSong() : playSong();
};

// Play the next song
nextButton.onclick = () => {
  currentSongIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
  loadSong(currentSongIndex);
};

// Play the previous song
prevButton.onclick = () => {
  currentSongIndex =
    (currentSongIndex - 1 + currentPlaylist.songs.length) %
    currentPlaylist.songs.length;
  loadSong(currentSongIndex);
};

// Update progress bar
audio.ontimeupdate = () => {
  progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeElement.textContent = formatTime(audio.currentTime);
};

// Seek song
progressBar.oninput = () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
};

// Update volume
volumeBar.oninput = () => {
  audio.volume = volumeBar.value;
};

// Update duration once metadata is loaded
audio.onloadedmetadata = () => {
  durationElement.textContent = formatTime(audio.duration);
};

// Format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

// Initialize the music player
loadPlaylists();
switchPlaylist(0); // Load the first playlist by default
