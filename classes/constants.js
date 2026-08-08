const SONGS_TO_FETCH = 6;
const DOWNLOAD_SCALING_FACTOR = 4;
const SELECTION_ANIMATION_DELAY = 300;
const NEXT_LINE_ANIMATION_DELAY = 30;
const SEARCHING_FOR_SONG = 'Searching for your song...';
const SEARCHING_FOR_LYRICS = "Searching for song's lyrics...";
const DOWNLOADING = 'Downloading lyrics image...';
const NO_LYRICS_FOUND =
    'No lyrics found<br>You can still type your own lyrics by clicking here :)';
const NO_LYRICS_SELECTED =
    'No lyrics selected<br>You can still type your own lyrics by clicking here :)';
const SPOTIFY_LOGO =
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg';
const APPLE_MUSIC_LOGO =
    'https://upload.wikimedia.org/wikipedia/commons/9/9d/AppleMusic_2019.svg';

const FONT_STACKS = {
    default: '',
    arial: "Arial, 'Helvetica Neue', sans-serif",
    verdana: 'Verdana, Geneva, sans-serif',
    tahoma: 'Tahoma, Geneva, sans-serif',
    trebuchet: "'Trebuchet MS', Helvetica, sans-serif",
    times: "'Times New Roman', Times, serif",
    georgia: "Georgia, 'Times New Roman', serif",
    garamond: "Garamond, 'Times New Roman', serif",
    courier: "'Courier New', Courier, monospace",
    brush: "'Brush Script MT', cursive",
    'zh-TW': '"Poppins", "Noto Sans TC", sans-serif',
    'zh-CN': '"Poppins", "Noto Sans SC", sans-serif',
    'zh-HK': '"Poppins", "Noto Sans HK", sans-serif',
    ja: '"Poppins", "Noto Sans JP", sans-serif',
    ko: '"Poppins", "Noto Sans KR", sans-serif',
};

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3
        ? h.split('').map((c) => c + c).join('')
        : h;
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
    };
}

function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isLightColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

const BACKGROUND_SHADOW_COLOR = 'rgba(0, 0, 0, 0.25)';
const BACKGROUND_SHADOW_BORDER_RADIUS = 24;
const BACKGROUND_SHADOW_BLUR = 12;
const BACKGROUND_SHADOW_OFFSET_X = 0;
const BACKGROUND_SHADOW_OFFSET_Y = 4;
const BACKGROUND_TO_SHADOW_FACTOR = 4;

const PRESETS_STORAGE_KEY = 'lyricpost-presets';

/*
 * Presets never carry song-specific things (cover art, uploaded service tag).
 * A missing key leaves that control untouched — Spotify omits bgColor on
 * purpose so the random per-song background survives applying it.
 */
const BUILT_IN_PRESETS = [
    {
        name: 'Spotify',
        settings: {
            bgColor: '#cd6800',
            textColor: '#181818',
            width: 320,
            cornerRadius: 24,
            backgroundTransparency: 100,
            backgroundBlur: 12,
            additionalBg: false,
            backdropCover: false,
            fontFamily: 'default',
            fontSize: 20,
            letterSpacing: 0,
            lineSpacing: 150,
            layoutStyle: 'spotify',
            infoBg: 0,
            serviceTag: 'spotify',
            tagPosition: 'bottom',
            tagHeight: 24,
        },
    },
    {
        name: 'Apple Music',
        settings: {
            bgColor: '#181818',
            textColor: '#f0f0f0',
            width: 320,
            cornerRadius: 20,
            backgroundTransparency: 55,
            backgroundBlur: 24,
            additionalBg: true,
            backdropCover: true,
            fontFamily: 'arial',
            fontSize: 24,
            letterSpacing: 0,
            lineSpacing: 135,
            layoutStyle: 'apple',
            infoBg: 12,
            serviceTag: 'apple',
            tagPosition: 'info',
            tagHeight: 16,
        },
    },
];

const COLORS = [
    '#008fd1',
    '#549aab',
    '#8fc00c',
    '#729962',
    '#a2904e',
    '#cd6800',
    '#fc302f',
    '#d6337b',
    '#7b52ab',
    '#f0f0f0',
    '#181818',
];
