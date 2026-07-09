const express = require('express');
const cors = require('cors');
const spotify = require('spotify-url-info')(fetch);
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/playlist', async (req, res) => {
    try {
        const url = req.query.url;
        if(!url) return res.status(400).json({error: "URL required"});
        
        // Fetch tracks and main data
        const [tracksData, mainData] = await Promise.all([
            spotify.getTracks(url),
            spotify.getData(url).catch(() => null)
        ]);
        
        // Extract main cover art (usually playlist or album cover)
        let mainCover = 'https://ui-avatars.com/api/?name=Music&background=1ed760&color=fff';
        if(mainData && mainData.coverArt && mainData.coverArt.sources && mainData.coverArt.sources.length > 0) {
            mainCover = mainData.coverArt.sources[0].url;
        } else if (mainData && mainData.images && mainData.images.length > 0) {
            mainCover = mainData.images[0].url;
        }
        
        const tracks = tracksData.map(track => {
            let artist = track.artists ? track.artists[0].name : (track.artist || 'Unknown Artist');
            
            // Try to find track specific image, fallback to main cover
            let trackImage = mainCover;
            if(track.album && track.album.images && track.album.images.length > 0) {
                trackImage = track.album.images[0].url;
            } else if (track.thumbnail) {
                trackImage = track.thumbnail;
            }
            
            return {
                name: track.name,
                artist: artist,
                query: `${track.name} ${artist} audio`,
                image: trackImage
            };
        });
        
        let playlistTitle = mainData ? (mainData.title || mainData.name || 'My Playlist') : 'My Playlist';
        
        res.json({ 
            title: playlistTitle,
            image: mainCover,
            tracks: tracks 
        });
    } catch (err) {
        console.error("Spotify Error:", err);
        res.status(500).json({error: "Gagal membaca playlist Spotify."});
    }
});

app.get('/api/stream', (req, res) => {
    const query = req.query.q;
    if(!query) return res.status(400).json({error: "Query required"});
    
    exec(`python -m yt_dlp -J -f "bestaudio" "ytsearch1:${query}"`, {maxBuffer: 1024 * 1024 * 10}, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({error: "Gagal mendapatkan audio: " + error.message});
        }
        
        try {
            const data = JSON.parse(stdout);
            const entry = data.entries ? data.entries[0] : data;
            const url = entry.url || (entry.requested_downloads ? entry.requested_downloads[0].url : null);
            
            let thumbnail = '';
            if (entry.thumbnails && entry.thumbnails.length > 0) {
                thumbnail = entry.thumbnails[entry.thumbnails.length - 1].url;
            }
            
            if (!url) {
                 return res.status(404).json({error: "Stream not found"});
            }
            
            res.json({
                title: entry.title || query,
                url: url,
                thumbnail: thumbnail
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({error: "Gagal parse output audio."});
        }
    });
});

app.get('/api/cover', async (req, res) => {
    const query = req.query.q;
    const fallback = req.query.fallback;
    
    if(!query) return res.redirect(fallback || 'https://via.placeholder.com/100');
    
    try {
        const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&entity=song`);
        const data = await itunesRes.json();
        
        if (data.results && data.results.length > 0) {
            // Replace 100x100 with 400x400 for better quality
            const hqCover = data.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
            return res.redirect(hqCover);
        }
    } catch (e) {
        console.error("iTunes cover error:", e);
    }
    
    // Fallback if not found
    res.redirect(fallback || 'https://via.placeholder.com/100');
});

app.listen(3000, () => {
    console.log("Backend with yt-dlp running on http://localhost:3000");
});
