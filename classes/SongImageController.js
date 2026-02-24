class SongImageController {
    /**
     * @param {DOMHandler} domHandler
     */
    constructor(domHandler) {
        this.dom = domHandler;
    }

    /**
     * Creates color selection DOM elements
     */
    populateColorSelection() {
        COLORS.forEach((color) => {
            const element = document.createElement('div');
            element.classList.add('select-color');
            element.style.backgroundColor = color;
            element.textContent = '.';

            element.addEventListener('click', () => {
                this.setSongImageColor(color);
            });

            this.dom.colorSelection.insertBefore(
                element,
                this.dom.colorSelection.querySelector('#custom-color')
            );
        });
    }

    /**
     * Displays song image final screen
     */
    displaySongImage() {
        this.setSongImage();
        this.dom.displayScreen(4);
        const width = this.dom.widthSlider.value;
        this.setSongImageWidth(width);
        this.dom.widthValue.textContent = `${width}px`;
        this.dom.lyricsFab.classList.add('hidden');
    }

    /**
     * Prepares song image DOM element
     */
    setSongImage() {
        this.setBase64Image(
            this.dom.songs[this.dom.selectedSongIndex].albumCoverUrl,
            '.song-image > .header > img'
        );
        this.setSongInfo();
        this.setSongLyrics(
            Array.from(document.querySelectorAll('.select-line.selected')).map(
                (selectLine) => Number(selectLine.dataset.index)
            )
        );
        this.setSongImageColor(
            COLORS[Math.floor(Math.random() * COLORS.length)]
        );
    }

    /**
     * Set's song image's colors
     * @param {string} background
     */
    setSongImageColor(background) {
        this.dom.songImage.style.backgroundColor = background;
    }

    /**
     * Sets song image's width
     * @param {number} width - Width in pixels
     */
    setSongImageWidth(width) {
        const numericWidth = Number(width);
        this.dom.songImage.style.setProperty(
            '--song-image-width',
            `${numericWidth}px`
        );

        const fullHeight = this.dom.songImage.offsetHeight;
        const screen = this.dom.songImage.closest('.lyrics-image-screen');

        if (!screen) {
            this.dom.songImage.style.setProperty('--song-image-scale', 1);
            this.dom.songImage.style.marginBottom = '0px';
            return;
        }

        const screenWidth = screen.clientWidth;
        const horizontalMargin = 32;
        const maxVisualWidth = Math.max(screenWidth - horizontalMargin, 0);

        const scale =
            numericWidth > 0 && maxVisualWidth > 0
                ? Math.min(1, maxVisualWidth / numericWidth)
                : 1;

        this.dom.songImage.style.setProperty('--song-image-scale', scale);

        const marginBottom = fullHeight * (scale - 1);
        this.dom.songImage.style.marginBottom = `${marginBottom}px`;
    }

    /**
     * Sets song image's name and author to the name of the fetched song
     */
    setSongInfo() {
        document.querySelector('.song-image > .header .name').textContent =
            this.dom.songs[this.dom.selectedSongIndex].name;
        document.querySelector('.song-image > .header .authors').textContent =
            this.dom.songs[this.dom.selectedSongIndex].artists
                .map((artist) => artist.name)
                .join(', ');
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        const lyrics =
            this.dom.songs[this.dom.selectedSongIndex].lyrics
                ?.filter((_, index) => indexes.includes(index))
                ?.map((lyric) => lyric.text)
                ?.join('<br>') ?? NO_LYRICS_FOUND;
        document.querySelector('.song-image > .lyrics').innerHTML =
            lyrics !== '' ? lyrics : NO_LYRICS_SELECTED;
    }

    /**
     * Downloads song image by generating canvas from its DOM elements
     */
    async downloadSongImage() {
        this.dom.displaySearching(DOWNLOADING);

        const song = this.dom.songs[this.dom.selectedSongIndex];
        const downloadName = `${song.artists
            .map((artist) => artist.name)
            .join(', ')} - ${song.name}.png`;

        let canvas = await html2canvas(this.dom.songImage, {
            backgroundColor: null,
            scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR,
        });

        if (
            this.dom.songImage.classList.contains(
                'additional-bg'
            )
        ) {
            canvas = this.addBgToDownloadCanvas(canvas);
        }

        canvas.toBlob((blob) => {
            window.saveAs(blob, downloadName);
            this.dom.hideSearching();
        });
    }

    /**
     * Adds background with shadow to the canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {HTMLCanvasElement} canvas with background and shadow
     */
    addBgToDownloadCanvas(canvas) {
        const backgroundColor = this.dom.songImage.style.backgroundColor;

        const borderRadius =
            BACKGROUND_SHADOW_BORDER_RADIUS *
            window.devicePixelRatio *
            DOWNLOAD_SCALING_FACTOR;

        const shadowBlur =
            BACKGROUND_SHADOW_BLUR *
            window.devicePixelRatio *
            DOWNLOAD_SCALING_FACTOR;

        const margin = shadowBlur * BACKGROUND_TO_SHADOW_FACTOR;

        const shadowOffsetX =
            BACKGROUND_SHADOW_OFFSET_X *
            window.devicePixelRatio *
            DOWNLOAD_SCALING_FACTOR;

        const shadowOffsetY =
            BACKGROUND_SHADOW_OFFSET_Y *
            window.devicePixelRatio *
            DOWNLOAD_SCALING_FACTOR;

        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = canvas.width + margin * 2;
        shadowCanvas.height = canvas.height + margin * 2;
        const shadowContext = shadowCanvas.getContext('2d');

        shadowContext.fillStyle = backgroundColor;
        shadowContext.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

        shadowContext.fillStyle = BACKGROUND_SHADOW_COLOR;
        shadowContext.filter = `blur(${shadowBlur}px)`;
        shadowContext.beginPath();
        shadowContext.moveTo(
            margin + shadowOffsetX + borderRadius,
            margin + shadowOffsetY
        );
        shadowContext.lineTo(
            margin + shadowOffsetX + canvas.width - borderRadius,
            margin + shadowOffsetY
        );
        shadowContext.quadraticCurveTo(
            margin + shadowOffsetX + canvas.width,
            margin + shadowOffsetY,
            margin + shadowOffsetX + canvas.width,
            margin + shadowOffsetY + borderRadius
        );
        shadowContext.lineTo(
            margin + shadowOffsetX + canvas.width,
            margin + shadowOffsetY + canvas.height - borderRadius
        );
        shadowContext.quadraticCurveTo(
            margin + shadowOffsetX + canvas.width,
            margin + shadowOffsetY + canvas.height,
            margin + shadowOffsetX + canvas.width - borderRadius,
            margin + shadowOffsetY + canvas.height
        );
        shadowContext.lineTo(
            margin + shadowOffsetX + borderRadius,
            margin + shadowOffsetY + canvas.height
        );
        shadowContext.quadraticCurveTo(
            margin + shadowOffsetX,
            margin + shadowOffsetY + canvas.height,
            margin + shadowOffsetX,
            margin + shadowOffsetY + canvas.height - borderRadius
        );
        shadowContext.lineTo(
            margin + shadowOffsetX,
            margin + shadowOffsetY + borderRadius
        );
        shadowContext.quadraticCurveTo(
            margin + shadowOffsetX,
            margin + shadowOffsetY,
            margin + shadowOffsetX + borderRadius,
            margin + shadowOffsetY
        );
        shadowContext.closePath();
        shadowContext.fill();

        shadowContext.filter = 'none';
        shadowContext.drawImage(canvas, margin, margin);

        return shadowCanvas;
    }

    /**
     * Converts cover image to base64 and sets it as image's source in order to avoid canvas CORS policy
     * @param {string} url
     * @param {string} imgSelector
     * @param {number?} newColor
     */
    async setBase64Image(url, imgSelector, newColor = null) {
        const response = await fetch(url);
        const blob = await response.blob();

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        if (newColor === null)
            return document
                .querySelector(imgSelector)
                .setAttribute('src', base64);

        const img = new Image();
        img.src = base64;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = data[i + 1] = data[i + 2] = newColor;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            document
                .querySelector(imgSelector)
                .setAttribute('src', canvas.toDataURL());
        };
    }
}

