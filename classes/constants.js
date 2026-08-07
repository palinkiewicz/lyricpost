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

const COLORS = [
    '#008fd1',
    '#549aab',
    '#8fc00c',
    '#729962',
    '#a2904e',
    '#cd6800',
    '#fc302f',
];
