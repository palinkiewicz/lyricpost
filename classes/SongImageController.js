class SongImageController {
    /**
     * @param {AppState} state
     * @param {AppShell} appShell
     */
    constructor(state, appShell) {
        this.state = state;
        this.appShell = appShell;

        /** @type {HTMLElement | null} */
        this.songImage = document.querySelector('.song-image');
        /** @type {HTMLElement | null} */
        this.colorSelection = document.querySelector('.color-selection');
        /** @type {HTMLInputElement | null} */
        this.customColorInput = document.querySelector('#custom-color input');
        /** @type {HTMLInputElement | null} */
        this.widthSlider = document.querySelector('#width-slider');
        /** @type {HTMLElement | null} */
        this.widthValue = document.querySelector('#width-value');
        /** @type {HTMLElement | null} */
        this.downloadButton = document.querySelector('#download');
        /** @type {HTMLElement | null} */
        this.lightTextSwitch = document.querySelector('#light-text');
        /** @type {HTMLElement | null} */
        this.spotifyTagSwitch = document.querySelector('#spotify-tag');
        /** @type {HTMLElement | null} */
        this.additionalBgSwitch = document.querySelector('#additional-bg');
        /** @type {HTMLElement | null} */
        this.lyricsFab = document.querySelector('#lyrics-fab');

        this.populateColorSelection();
        this.registerListeners();
        this.setBase64Image(
            SPOTIFY_LOGO,
            '.song-image > .spotify > img',
            0
        );
    }

    registerListeners() {
        if (this.customColorInput) {
            this.customColorInput.addEventListener('input', () => {
                this.setSongImageColor(this.customColorInput.value);
            });
        }

        document.querySelectorAll('.switch-container').forEach((container) => {
            container.addEventListener('click', () => {
                container.classList.toggle('on');
            });
        });

        if (this.lightTextSwitch && this.songImage) {
            this.lightTextSwitch.addEventListener('click', () => {
                this.songImage.classList.toggle('light-text');

                this.setBase64Image(
                    SPOTIFY_LOGO,
                    '.song-image > .spotify > img',
                    this.songImage.classList.contains('light-text') ? 255 : 0
                );
            });
        }

        if (this.spotifyTagSwitch && this.songImage) {
            this.spotifyTagSwitch.addEventListener('click', () => {
                this.songImage.classList.toggle('spotify-tag');
            });
        }

        if (this.additionalBgSwitch && this.songImage) {
            this.additionalBgSwitch.addEventListener('click', () => {
                this.songImage.classList.toggle('additional-bg');
            });
        }

        if (this.downloadButton) {
            this.downloadButton.addEventListener('click', () => {
                this.downloadSongImage();
            });
        }

        if (this.widthSlider && this.widthValue) {
            this.widthSlider.addEventListener('input', () => {
                const width = this.widthSlider.value;
                this.setSongImageWidth(width);
                this.widthValue.textContent = `${width}px`;
            });

            window.addEventListener('resize', () => {
                this.setSongImageWidth(this.widthSlider.value);
            });
        }

        // Tabs inside final options
        document
            .querySelectorAll('.tab-selectors > button')
            .forEach((selector) => {
                selector.addEventListener('click', () => {
                    const currentPrimary = document.querySelector(
                        '.tab-selectors > .primary'
                    );
                    if (currentPrimary) {
                        currentPrimary.classList.remove('primary');
                    }
                    selector.classList.add('primary');

                    const currentPanel = document.querySelector(
                        '.tabs > .selected'
                    );
                    if (currentPanel) {
                        currentPanel.classList.remove('selected');
                    }

                    const newlySelected = document.querySelector(
                        `.tabs > div:nth-child(${selector.dataset.number})`
                    );
                    if (newlySelected) {
                        newlySelected.classList.add('selected');
                        const options = document.querySelector('.options');
                        if (options) {
                            options.style.height =
                                newlySelected.offsetHeight + 44 + 'px';
                        }
                    }
                });
            });

        // Paste into contenteditable as plain text
        document.querySelectorAll('[contenteditable]').forEach((field) => {
            field.addEventListener('paste', function (event) {
                event.preventDefault();
                document.execCommand(
                    'inserttext',
                    false,
                    event.clipboardData.getData('text/plain')
                );
            });
        });
    }

    /**
     * Creates color selection DOM elements
     */
    populateColorSelection() {
        if (!this.colorSelection) {
            return;
        }

        COLORS.forEach((color) => {
            const element = document.createElement('div');
            element.classList.add('select-color');
            element.style.backgroundColor = color;
            element.textContent = '.';

            element.addEventListener('click', () => {
                this.setSongImageColor(color);
            });

            this.colorSelection.insertBefore(
                element,
                this.colorSelection.querySelector('#custom-color')
            );
        });
    }

    /**
     * Displays song image final screen
     */
    displaySongImage() {
        this.setSongImage();
        this.appShell.displayScreen(4);

        if (this.widthSlider && this.widthValue) {
            const width = this.widthSlider.value;
            this.setSongImageWidth(width);
            this.widthValue.textContent = `${width}px`;
        }

        if (this.lyricsFab) {
            this.lyricsFab.classList.add('hidden');
        }
    }

    /**
     * Prepares song image DOM element
     */
    setSongImage() {
        if (!this.state.selectedSong) {
            return;
        }

        this.setBase64Image(
            this.state.selectedSong.albumCoverUrl,
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
        if (this.songImage) {
            this.songImage.style.backgroundColor = background;
        }
    }

    /**
     * Sets song image's width
     * @param {number} width - Width in pixels
     */
    setSongImageWidth(width) {
        if (!this.songImage) {
            return;
        }

        const numericWidth = Number(width);
        this.songImage.style.setProperty(
            '--song-image-width',
            `${numericWidth}px`
        );

        const fullHeight = this.songImage.offsetHeight;
        const screen = this.songImage.closest('.lyrics-image-screen');

        if (!screen) {
            this.songImage.style.setProperty('--song-image-scale', 1);
            this.songImage.style.marginBottom = '0px';
            return;
        }

        const screenWidth = screen.clientWidth;
        const horizontalMargin = 32;
        const maxVisualWidth = Math.max(screenWidth - horizontalMargin, 0);

        const scale =
            numericWidth > 0 && maxVisualWidth > 0
                ? Math.min(1, maxVisualWidth / numericWidth)
                : 1;

        this.songImage.style.setProperty('--song-image-scale', scale);

        const marginBottom = fullHeight * (scale - 1);
        this.songImage.style.marginBottom = `${marginBottom}px`;
    }

    /**
     * Sets song image's name and author to the name of the fetched song
     */
    setSongInfo() {
        if (!this.state.selectedSong) {
            return;
        }

        document.querySelector('.song-image > .header .name').textContent =
            this.state.selectedSong.name;
        document.querySelector('.song-image > .header .authors').textContent =
            this.state.selectedSong.artists
                .map((artist) => artist.name)
                .join(', ');
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        if (!this.state.selectedSong) {
            return;
        }

        const lyrics =
            this.state.selectedSong.lyrics
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
        if (!this.songImage) {
            return;
        }

        this.appShell.displaySearching(DOWNLOADING);

        const song = this.state.selectedSong;

        if (!song) {
            this.appShell.hideSearching();
            return;
        }

        const downloadName = `${song.artists
            .map((artist) => artist.name)
            .join(', ')} - ${song.name}.png`;

        let canvas = await html2canvas(this.songImage, {
            backgroundColor: null,
            scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR,
        });

        if (
            this.songImage.classList.contains(
                'additional-bg'
            )
        ) {
            canvas = this.addBgToDownloadCanvas(canvas);
        }

        canvas.toBlob((blob) => {
            window.saveAs(blob, downloadName);
            this.appShell.hideSearching();
        });
    }

    /**
     * Adds background with shadow to the canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {HTMLCanvasElement} canvas with background and shadow
     */
    addBgToDownloadCanvas(canvas) {
        const backgroundColor = this.songImage
            ? this.songImage.style.backgroundColor
            : 'transparent';

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

