document.addEventListener('DOMContentLoaded', () => {
    // Views
    const viewSearch = document.getElementById('view-search');
    const viewPlaylist = document.getElementById('view-playlist');
    const viewPlayer = document.getElementById('view-player');
    const miniPlayer = document.getElementById('mini-player');
    
    // Inputs & Buttons
    const loadBtn = document.getElementById('load-btn');
    const input = document.getElementById('playlist-input');
    const trackListEl = document.getElementById('track-list');
    const loadingEl = document.getElementById('loading');
    const audio = document.getElementById('audio-player');
    
    // Navigation
    const btnBackSearch = document.getElementById('btn-back-search');
    const mpOpenFullText = document.getElementById('mp-open-full-text');
    const mpOpenFullImg = document.getElementById('mp-image');
    const btnClosePlayer = document.getElementById('btn-close-player');

    // UI Updating Elements
    const plTitle = document.getElementById('pl-title');
    const plCover = document.getElementById('pl-cover');
    const mpTitle = document.getElementById('mp-title');
    const mpArtist = document.getElementById('mp-artist');
    const mpImage = document.getElementById('mp-image');
    const fpTitle = document.getElementById('fp-title');
    const fpArtist = document.getElementById('fp-artist');
    const fpImage = document.getElementById('fp-image');
    const fpPlaylistName = document.getElementById('fp-playlist-name');

    // Playback Controls
    const btnMpPlay = document.getElementById('btn-mp-play');
    const btnFpPlay = document.getElementById('btn-fp-play');
    const btnFpPrev = document.getElementById('btn-fp-prev');
    const btnFpNext = document.getElementById('btn-fp-next');
    
    // Progress
    const mpProgressFill = document.getElementById('mp-progress-fill');
    const fpProgressFill = document.getElementById('fp-progress-fill');
    const fpProgressBar = document.getElementById('fp-progress-bar');
    const fpTimeCurrent = document.getElementById('fp-time-current');
    const fpTimeTotal = document.getElementById('fp-time-total');

    let currentTracks = [];
    let currentIndex = -1;
    let isPlaying = false;

    // View Switching
    btnBackSearch.addEventListener('click', () => {
        viewPlaylist.style.display = 'none';
        viewSearch.style.display = 'block';
    });

    const openFullPlayer = () => { viewPlayer.style.transform = 'translateY(0)'; };
    mpOpenFullText.addEventListener('click', openFullPlayer);
    mpOpenFullImg.addEventListener('click', openFullPlayer);

    btnClosePlayer.addEventListener('click', () => {
        viewPlayer.style.transform = 'translateY(100%)';
    });

    // Load Playlist
    loadBtn.addEventListener('click', async () => {
        const url = input.value.trim();
        if(!url) return;
        loadingEl.style.display = 'block';

        try {
            const res = await fetch(`http://localhost:3000/api/playlist?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            loadingEl.style.display = 'none';

            if(data.error) {
                alert(data.error); return;
            }

            currentTracks = data.tracks;
            
            // Set Playlist Info
            plTitle.textContent = data.title;
            plCover.src = data.image;
            fpPlaylistName.textContent = data.title;
            
            const fpBottomPlTitle = document.getElementById('fp-bottom-pl-title');
            const fpBottomPlImage = document.getElementById('fp-bottom-pl-image');
            if (fpBottomPlTitle) fpBottomPlTitle.textContent = data.title;
            if (fpBottomPlImage) fpBottomPlImage.src = data.image;
            
            const plCreatorAvatar = document.getElementById('pl-creator-avatar');
            if (plCreatorAvatar) plCreatorAvatar.src = data.image;

            renderTrackList();
            viewSearch.style.display = 'none';
            viewPlaylist.style.display = 'block';
        } catch (e) {
            loadingEl.style.display = 'none';
            alert('Gagal terhubung ke backend. Pastikan server berjalan.');
        }
    });

    function renderTrackList() {
        trackListEl.innerHTML = '';
        currentTracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'track-item';
            
            // Build the URL for the lazy-loaded image
            const lazyImgUrl = `http://localhost:3000/api/cover?q=${encodeURIComponent(track.name + ' ' + track.artist)}&fallback=${encodeURIComponent(track.image)}`;
            
            li.innerHTML = `
                <img class="track-img" src="${lazyImgUrl}" alt="cover">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div style="color: var(--text-secondary); font-size: 16px;"><i class="fa-solid fa-ellipsis-vertical"></i></div>
            `;
            li.addEventListener('click', () => playTrack(index));
            trackListEl.appendChild(li);
        });
    }

    async function playTrack(index) {
        if(index < 0 || index >= currentTracks.length) return;
        
        miniPlayer.style.display = 'flex';
        
        const items = document.querySelectorAll('.track-item');
        items.forEach(el => el.classList.remove('playing'));
        if(items[index]) items[index].classList.add('playing');

        currentIndex = index;
        const track = currentTracks[index];
        const lazyImgUrl = `http://localhost:3000/api/cover?q=${encodeURIComponent(track.name + ' ' + track.artist)}&fallback=${encodeURIComponent(track.image)}`;

        // Update UI Text & Image
        mpTitle.textContent = "Loading...";
        mpArtist.textContent = track.artist;
        mpImage.src = lazyImgUrl;
        
        fpTitle.textContent = "Loading...";
        fpArtist.textContent = track.artist;
        fpImage.src = lazyImgUrl;

        mpProgressFill.style.width = '0%';
        fpProgressFill.style.width = '0%';
        
        setPlayState(false, true);

        try {
            const res = await fetch(`http://localhost:3000/api/stream?q=${encodeURIComponent(track.query)}`);
            const data = await res.json();

            if(data.error) {
                alert("Gagal memutar lagu: " + data.error);
                setPlayState(false);
                mpTitle.textContent = track.name; fpTitle.textContent = track.name;
                return;
            }

            mpTitle.textContent = track.name;
            fpTitle.textContent = track.name;
            audio.src = data.url;
            audio.play();
            setPlayState(true);
            
        } catch (e) {
            alert('Terjadi kesalahan saat mengambil stream.');
            setPlayState(false);
            mpTitle.textContent = track.name; fpTitle.textContent = track.name;
        }
    }

    function setPlayState(playing, loading = false) {
        isPlaying = playing;
        if(loading) {
            btnMpPlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btnFpPlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        } else if(playing) {
            btnMpPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
            btnFpPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            btnMpPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
            btnFpPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    }

    function togglePlay() {
        if(audio.src) {
            if(isPlaying) { audio.pause(); setPlayState(false); } 
            else { audio.play(); setPlayState(true); }
        }
    }

    btnMpPlay.addEventListener('click', togglePlay);
    btnFpPlay.addEventListener('click', togglePlay);
    btnFpNext.addEventListener('click', () => playTrack(currentIndex + 1));
    btnFpPrev.addEventListener('click', () => playTrack(currentIndex - 1));

    audio.addEventListener('ended', () => playTrack(currentIndex + 1));

    function formatTime(seconds) {
        if(isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    audio.addEventListener('timeupdate', () => {
        if(audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            mpProgressFill.style.width = `${percent}%`;
            fpProgressFill.style.width = `${percent}%`;
            fpProgressBar.value = percent;
            fpTimeCurrent.textContent = formatTime(audio.currentTime);
            fpTimeTotal.textContent = formatTime(audio.duration);
        }
    });

    fpProgressBar.addEventListener('input', (e) => {
        if(audio.duration) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
            fpProgressFill.style.width = `${e.target.value}%`;
        }
    });

    // Auto-load default playlist
    if(input.value) {
        setTimeout(() => loadBtn.click(), 300);
    }
});
