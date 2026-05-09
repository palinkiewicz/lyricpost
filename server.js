const path = require('path');
const express = require('express');
require('dotenv').config();

const FALLBACK_LASTFM_KEY = 'b362b9a7f5f0c5a7f749d568b68bc32a';
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || FALLBACK_LASTFM_KEY;
const USER_AGENT = 'Application LyricPost/1.0 (pogromca.ap@gmail.com)';
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LRCLIB_BASE = 'https://lrclib.net/api/search';

if (!process.env.LASTFM_API_KEY) {
    console.warn('[LyricPost] LASTFM_API_KEY not set in environment; using bundled fallback key. Create a .env file to override.');
}

const app = express();

// Serve the static frontend from the project root.
app.use(express.static(path.join(__dirname)));

/**
 * Calls the Last.fm track.getInfo endpoint with the given query params.
 * Returns the parsed `track` object or null.
 */
async function lastfmGetInfo(params) {
    const url = new URL(LASTFM_BASE);
    url.searchParams.set('method', 'track.getInfo');
    url.searchParams.set('api_key', LASTFM_API_KEY);
    url.searchParams.set('format', 'json');
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) {
        const err = new Error(`Last.fm request failed (${response.status})`);
        err.status = response.status;
        throw err;
    }
    const result = await response.json();
    return result.track || null;
}

// GET /api/songs/search?name=<query>&limit=<n>
app.get('/api/songs/search', async (req, res) => {
    const name = (req.query.name || '').toString();
    const limit = Number(req.query.limit) || 1;

    if (!name.trim()) {
        return res.status(400).json({ error: 'Missing required query parameter "name".' });
    }

    try {
        const searchUrl = new URL(LASTFM_BASE);
        searchUrl.searchParams.set('method', 'track.search');
        searchUrl.searchParams.set('track', name);
        searchUrl.searchParams.set('api_key', LASTFM_API_KEY);
        searchUrl.searchParams.set('format', 'json');
        searchUrl.searchParams.set('limit', String(limit));

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            return res.status(502).json({ error: 'Upstream search request failed.' });
        }
        const searchResult = await searchResponse.json();
        const tracks = searchResult?.results?.trackmatches?.track || [];

        const detailed = await Promise.all(
            tracks.map(async (searchTrack) => {
                try {
                    return await lastfmGetInfo({
                        artist: searchTrack.artist,
                        track: searchTrack.name,
                    });
                } catch (err) {
                    console.error('Failed to fetch track info for', searchTrack.name, err.message);
                    return null;
                }
            })
        );

        res.json(detailed.filter((t) => t !== null));
    } catch (err) {
        console.error('Search endpoint error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/songs/track/:mbid
app.get('/api/songs/track/:mbid', async (req, res) => {
    const { mbid } = req.params;
    if (!mbid) {
        return res.status(400).json({ error: 'Missing mbid.' });
    }

    try {
        const track = await lastfmGetInfo({ mbid });
        if (!track) {
            return res.status(404).json({ error: 'Track not found.' });
        }
        res.json(track);
    } catch (err) {
        console.error('Track-by-mbid error:', err.message);
        const status = err.status === 404 ? 404 : 502;
        res.status(status).json({ error: 'Failed to fetch track.' });
    }
});

// GET /api/lyrics?artist=<a>&track=<t>
app.get('/api/lyrics', async (req, res) => {
    const artist = (req.query.artist || '').toString();
    const track = (req.query.track || '').toString();

    if (!artist.trim() || !track.trim()) {
        return res.status(400).json({ error: 'Missing required query parameters "artist" and "track".' });
    }

    try {
        const lrcUrl = `${LRCLIB_BASE}?q=${encodeURIComponent(`${artist} ${track}`)}`;
        const response = await fetch(lrcUrl);
        if (!response.ok) {
            return res.status(502).json({ error: 'Upstream lyrics request failed.' });
        }
        const result = await response.json();

        if (!Array.isArray(result)) {
            return res.json(null);
        }

        const target = track.toLowerCase().trim();
        const filtered = result.filter(
            (data) => data?.trackName?.toLowerCase().trim() === target
        );

        res.json(filtered[0] ?? result[0] ?? null);
    } catch (err) {
        console.error('Lyrics endpoint error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LyricPost server listening on http://localhost:${PORT}`);
});
