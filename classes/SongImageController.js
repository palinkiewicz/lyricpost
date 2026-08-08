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
        this.songImageWrap = document.querySelector('.song-image-wrap');
        /** @type {HTMLElement | null} */
        this.colorSelection = document.querySelector('.color-selection');
        /** @type {HTMLInputElement | null} */
        this.customColorInput = document.querySelector('#custom-color-input');
        /** @type {HTMLElement | null} */
        this.textColorSelection = document.querySelector('#text-color-selection');
        /** @type {HTMLInputElement | null} */
        this.textCustomColorInput = document.querySelector('#text-custom-color-input');
        /** @type {HTMLInputElement | null} */
        this.widthSlider = document.querySelector('#width-slider');
        /** @type {HTMLElement | null} */
        this.widthValue = document.querySelector('#width-value');
        /** @type {HTMLElement | null} */
        this.downloadButton = document.querySelector('#download');
        /** @type {HTMLElement | null} */
        this.additionalBgSwitch = document.querySelector('#additional-bg');
        /** @type {HTMLElement | null} */
        this.backdropCoverSwitch = document.querySelector('#backdrop-cover');
        /** @type {HTMLElement | null} */
        this.lyricsFab = document.querySelector('#lyrics-fab');

        // Background controls
        /** @type {HTMLInputElement | null} */
        this.cornerRadiusSlider = document.querySelector('#corner-radius-slider');
        /** @type {HTMLElement | null} */
        this.cornerRadiusValue = document.querySelector('#corner-radius-value');
        /** @type {HTMLInputElement | null} */
        this.backgroundTransparencySlider = document.querySelector(
            '#background-transparency-slider'
        );
        /** @type {HTMLElement | null} */
        this.backgroundTransparencyValue = document.querySelector(
            '#background-transparency-value'
        );
        /** @type {HTMLInputElement | null} */
        this.backgroundBlurSlider = document.querySelector('#background-blur-slider');
        /** @type {HTMLElement | null} */
        this.backgroundBlurValue = document.querySelector('#background-blur-value');

        // Text controls
        /** @type {HTMLSelectElement | null} */
        this.fontFamilySelect = document.querySelector('#text-font-family');
        /** @type {HTMLInputElement | null} */
        this.fontSizeSlider = document.querySelector('#font-size-slider');
        /** @type {HTMLElement | null} */
        this.fontSizeValue = document.querySelector('#font-size-value');
        /** @type {HTMLInputElement | null} */
        this.letterSpacingSlider = document.querySelector('#letter-spacing-slider');
        /** @type {HTMLElement | null} */
        this.letterSpacingValue = document.querySelector('#letter-spacing-value');
        /** @type {HTMLInputElement | null} */
        this.lineSpacingSlider = document.querySelector('#line-spacing-slider');
        /** @type {HTMLElement | null} */
        this.lineSpacingValue = document.querySelector('#line-spacing-value');

        // Other tab
        /** @type {HTMLSelectElement | null} */
        this.layoutStyleSelect = document.querySelector('#layout-style');
        /** @type {HTMLInputElement | null} */
        this.infoBgSlider = document.querySelector('#info-bg-slider');
        /** @type {HTMLElement | null} */
        this.infoBgValue = document.querySelector('#info-bg-value');
        /** @type {HTMLSelectElement | null} */
        this.serviceTagSelect = document.querySelector('#service-tag');
        /** @type {HTMLInputElement | null} */
        this.serviceTagFileInput = document.querySelector('#service-tag-file');
        /** @type {HTMLSelectElement | null} */
        this.tagPositionSelect = document.querySelector('#tag-position');
        /** @type {HTMLInputElement | null} */
        this.tagHeightSlider = document.querySelector('#tag-height-slider');
        /** @type {HTMLElement | null} */
        this.tagHeightValue = document.querySelector('#tag-height-value');
        /** @type {HTMLInputElement | null} */
        this.coverArtFileInput = document.querySelector('#cover-art-file');
        /** @type {HTMLImageElement | null} */
        this.coverImg = document.querySelector('.song-image > .header > img');
        /** @type {HTMLElement | null} */
        this.tagContainer = document.querySelector('.song-image .spotify');

        // Dynamic background state
        this.shadowCornerRadius = BACKGROUND_SHADOW_BORDER_RADIUS;
        this.shadowBlur = BACKGROUND_SHADOW_BLUR;
        this.shadowOpacity = 0.25;

        // Image background state
        this.coverBase64 = null;
        /** Blurred cover without the color tint, drawn on the export backdrop. */
        this.backdropCanvas = null;
        this.currentBgColor = COLORS[0];
        this.currentTextColor = contrastingTextColor(COLORS[0]);
        this.customTagActive = false;
        this._bgRenderTimer = null;

        this.buildColorPalette(
            this.colorSelection,
            (c) => this.setSongImageColor(c),
            this.customColorInput
        );
        this.buildColorPalette(
            this.textColorSelection,
            (c) => this.setSongTextColor(c),
            this.textCustomColorInput
        );
        this.registerListeners();
    }

    registerListeners() {
        document.querySelectorAll('.switch-container').forEach((container) => {
            container.addEventListener('click', () => {
                container.classList.toggle('on');
            });
        });

        if (this.additionalBgSwitch && this.songImage) {
            this.additionalBgSwitch.addEventListener('click', () => {
                // The generic .switch-container handler above has already
                // flipped the switch, so read the new state from it.
                const on = this.additionalBgSwitch.classList.contains('on');
                this.songImage.classList.toggle('additional-bg', on);
                this.songImageWrap?.classList.toggle(
                    'additional-bg-preview',
                    on
                );
                // The backdrop cover only means anything with a backdrop.
                this.backdropCoverSwitch?.classList.toggle('unavailable', !on);
                this.updateOptionsHeight();
                setTimeout(() => this.updateOptionsHeight(), 250);
            });
        }

        if (this.backdropCoverSwitch && this.songImageWrap) {
            this.backdropCoverSwitch.addEventListener('click', () => {
                this.songImageWrap.classList.toggle(
                    'backdrop-cover',
                    this.backdropCoverSwitch.classList.contains('on')
                );
            });
        }

        if (this.cornerRadiusSlider && this.cornerRadiusValue && this.songImage) {
            const applyCornerRadius = () => {
                const radius = Number(this.cornerRadiusSlider.value);
                this.shadowCornerRadius = radius;
                this.songImage.style.setProperty(
                    '--song-border-radius',
                    `${radius}px`
                );
                this.cornerRadiusValue.textContent = `${radius}px`;
            };

            applyCornerRadius();
            this.cornerRadiusSlider.addEventListener('input', applyCornerRadius);
        }

        if (
            this.backgroundTransparencySlider &&
            this.backgroundTransparencyValue
        ) {
            const applyTransparency = () => {
                const value = Number(this.backgroundTransparencySlider.value);
                this.shadowOpacity = value / 100;
                this.backgroundTransparencyValue.textContent = `${value}%`;
                this._debouncedRenderBg();
            };

            applyTransparency();
            this.backgroundTransparencySlider.addEventListener(
                'input',
                applyTransparency
            );
        }

        if (this.backgroundBlurSlider && this.backgroundBlurValue) {
            const applyBlur = () => {
                const value = Number(this.backgroundBlurSlider.value);
                this.shadowBlur = value;
                this.backgroundBlurValue.textContent = `${value}px`;
                this._debouncedRenderBg();
            };

            applyBlur();
            this.backgroundBlurSlider.addEventListener('input', applyBlur);
        }

        if (this.fontFamilySelect && this.songImage) {
            const applyFontFamily = () => {
                const value = this.fontFamilySelect.value;
                const stack = FONT_STACKS[value] ?? '';
                if (stack) {
                    this.songImage.style.setProperty('--song-font-family', stack);
                } else {
                    this.songImage.style.removeProperty('--song-font-family');
                }
            };

            applyFontFamily();
            this.fontFamilySelect.addEventListener('change', applyFontFamily);
        }

        if (this.fontSizeSlider && this.fontSizeValue && this.songImage) {
            const applyFontSize = () => {
                const value = Number(this.fontSizeSlider.value);
                this.songImage.style.setProperty(
                    '--song-lyrics-font-size',
                    `${value}px`
                );
                this.fontSizeValue.textContent = `${value}px`;
            };

            applyFontSize();
            this.fontSizeSlider.addEventListener('input', applyFontSize);
        }

        if (this.letterSpacingSlider && this.letterSpacingValue && this.songImage) {
            const applyLetterSpacing = () => {
                const value = Number(this.letterSpacingSlider.value);
                this.songImage.style.setProperty(
                    '--song-letter-spacing',
                    `${value}px`
                );
                this.letterSpacingValue.textContent = `${value}px`;
            };

            applyLetterSpacing();
            this.letterSpacingSlider.addEventListener('input', applyLetterSpacing);
        }

        if (this.lineSpacingSlider && this.lineSpacingValue && this.songImage) {
            const applyLineSpacing = () => {
                const value = Number(this.lineSpacingSlider.value);
                const lineHeight = value / 100;
                this.songImage.style.setProperty(
                    '--song-line-height',
                    `${lineHeight}em`
                );
                this.lineSpacingValue.textContent = `${value}%`;
            };

            applyLineSpacing();
            this.lineSpacingSlider.addEventListener('input', applyLineSpacing);
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

        if (this.layoutStyleSelect && this.songImage) {
            const applyLayoutStyle = () => {
                const value = this.layoutStyleSelect.value;
                this.songImage.classList.remove('layout-spotify', 'layout-apple');
                if (value === 'apple') {
                    this.songImage.classList.add('layout-apple');
                } else {
                    this.songImage.classList.add('layout-spotify');
                }
            };

            applyLayoutStyle();
            this.layoutStyleSelect.addEventListener('change', applyLayoutStyle);
        }

        if (this.infoBgSlider && this.infoBgValue) {
            const applyInfoBg = () => {
                this.infoBgValue.textContent = `${this.infoBgSlider.value}%`;
                this.updateInfoBackground();
            };

            applyInfoBg();
            this.infoBgSlider.addEventListener('input', applyInfoBg);
        }

        if (this.tagPositionSelect && this.songImage) {
            const applyTagPosition = () => this.updateTagPosition();

            applyTagPosition();
            this.tagPositionSelect.addEventListener('change', applyTagPosition);
        }

        if (this.serviceTagSelect) {
            this.serviceTagSelect.addEventListener('change', () => {
                this.customTagActive = false;
                this.updateServiceTag();
            });
        }

        if (this.serviceTagFileInput) {
            this.serviceTagFileInput.addEventListener('change', () => {
                if (this.serviceTagFileInput.files?.length) {
                    this.customTagActive = true;
                    this.applyCustomServiceTagImage();
                }
            });
        }

        if (this.coverArtFileInput) {
            this.coverArtFileInput.addEventListener('change', () => {
                if (this.coverArtFileInput.files?.length) {
                    this.applyCustomCoverArt(this.coverArtFileInput.files[0]);
                }
            });
        }

        // Clicking the cover art triggers the same upload action.
        if (this.coverImg && this.coverArtFileInput) {
            this.coverImg.addEventListener('click', () => {
                this.coverArtFileInput.click();
            });
        }

        if (this.tagHeightSlider && this.tagHeightValue && this.songImage) {
            const applyTagHeight = () => {
                const value = Number(this.tagHeightSlider.value);
                this.songImage.style.setProperty(
                    '--song-tag-height',
                    `${value}px`
                );
                this.tagHeightValue.textContent = `${value}px`;
            };

            applyTagHeight();
            this.tagHeightSlider.addEventListener('input', applyTagHeight);
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
                        this.updateOptionsHeight();
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
     * Builds a color swatch palette inside container, wired to onSelect.
     * @param {HTMLElement | null} container
     * @param {(color: string) => void} onSelect
     * @param {HTMLInputElement | null} customInput
     */
    buildColorPalette(container, onSelect, customInput) {
        if (!container) return;

        COLORS.forEach((color) => {
            const el = document.createElement('div');
            el.classList.add('select-color');
            el.style.backgroundColor = color;
            el.textContent = '.';
            el.addEventListener('click', () => onSelect(color));
            container.insertBefore(el, container.querySelector('.custom-color'));
        });

        if (customInput) {
            customInput.addEventListener('input', () => onSelect(customInput.value));
        }
    }

    /**
     * Collects every presetable customization. Song-specific things (cover
     * art, an uploaded service tag) are deliberately left out.
     * @returns {object}
     */
    getSettings() {
        return {
            bgColor: this.currentBgColor,
            textColor: this.currentTextColor,
            width: this.widthSlider?.value,
            cornerRadius: this.cornerRadiusSlider?.value,
            backgroundTransparency: this.backgroundTransparencySlider?.value,
            backgroundBlur: this.backgroundBlurSlider?.value,
            additionalBg: this.additionalBgSwitch?.classList.contains('on'),
            backdropCover: this.backdropCoverSwitch?.classList.contains('on'),
            fontFamily: this.fontFamilySelect?.value,
            fontSize: this.fontSizeSlider?.value,
            letterSpacing: this.letterSpacingSlider?.value,
            lineSpacing: this.lineSpacingSlider?.value,
            layoutStyle: this.layoutStyleSelect?.value,
            infoBg: this.infoBgSlider?.value,
            serviceTag: this.serviceTagSelect?.value,
            tagPosition: this.tagPositionSelect?.value,
            tagHeight: this.tagHeightSlider?.value,
        };
    }

    /**
     * Applies a settings object produced by getSettings(). Every control is
     * driven through its own event handler, so a preset goes through exactly
     * the same code path as the user moving the control. Keys that are absent
     * leave their control untouched.
     * @param {object} settings
     */
    applySettings(settings) {
        if (!settings) {
            return;
        }

        if (settings.bgColor) {
            this.setSongImageColor(settings.bgColor);
            if (this.customColorInput) {
                this.customColorInput.value = settings.bgColor;
            }
        }

        if (settings.textColor) {
            this.setSongTextColor(settings.textColor);
            if (this.textCustomColorInput) {
                this.textCustomColorInput.value = settings.textColor;
            }
        }

        this.setControlValue(this.widthSlider, settings.width, 'input');
        this.setControlValue(
            this.cornerRadiusSlider,
            settings.cornerRadius,
            'input'
        );
        this.setControlValue(
            this.backgroundTransparencySlider,
            settings.backgroundTransparency,
            'input'
        );
        this.setControlValue(
            this.backgroundBlurSlider,
            settings.backgroundBlur,
            'input'
        );
        this.setControlValue(this.fontFamilySelect, settings.fontFamily, 'change');
        this.setControlValue(this.fontSizeSlider, settings.fontSize, 'input');
        this.setControlValue(
            this.letterSpacingSlider,
            settings.letterSpacing,
            'input'
        );
        this.setControlValue(
            this.lineSpacingSlider,
            settings.lineSpacing,
            'input'
        );
        this.setControlValue(
            this.layoutStyleSelect,
            settings.layoutStyle,
            'change'
        );
        this.setControlValue(this.infoBgSlider, settings.infoBg, 'input');
        this.setControlValue(this.serviceTagSelect, settings.serviceTag, 'change');
        this.setControlValue(
            this.tagPositionSelect,
            settings.tagPosition,
            'change'
        );
        this.setControlValue(this.tagHeightSlider, settings.tagHeight, 'input');

        this.setSwitchState(this.additionalBgSwitch, settings.additionalBg);
        this.setSwitchState(this.backdropCoverSwitch, settings.backdropCover);
    }

    /**
     * Sets an input/select value and notifies its listeners.
     * @param {HTMLInputElement | HTMLSelectElement | null} control
     * @param {string | number | undefined} value
     * @param {'input' | 'change'} eventName
     */
    setControlValue(control, value, eventName) {
        if (!control || value === undefined || value === null) {
            return;
        }

        control.value = value;
        control.dispatchEvent(new Event(eventName));
    }

    /**
     * Brings a switch to the wanted state through a real click, so whatever is
     * wired to it runs too.
     * @param {HTMLElement | null} container
     * @param {boolean | undefined} on
     */
    setSwitchState(container, on) {
        if (!container || on === undefined || on === null) {
            return;
        }

        if (container.classList.contains('on') !== Boolean(on)) {
            container.click();
        }
    }

    /**
     * Sizes the .options box to the currently selected tab panel so the panel
     * isn't mispositioned (the CSS default height is otherwise only corrected
     * once the user switches tabs).
     */
    updateOptionsHeight() {
        const options = document.querySelector('.options');
        const selectors = document.querySelector('.tab-selectors');
        const selected = document.querySelector('.tabs > .selected');
        if (!options || !selected) {
            return;
        }

        const selectorsHeight = selectors ? selectors.offsetHeight : 0;
        const marginTop =
            parseFloat(getComputedStyle(selected).marginTop) || 0;

        options.style.height =
            selectorsHeight + marginTop + selected.offsetHeight + 'px';
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

        // Recompute across the screen-entry animation: once immediately, and
        // again after the transition settles, since measuring mid-animation
        // yields a short height that leaves the panel mispositioned.
        this.updateOptionsHeight();
        requestAnimationFrame(() => this.updateOptionsHeight());
        setTimeout(() => this.updateOptionsHeight(), 550);
        if (document.fonts?.ready) {
            document.fonts.ready.then(() => this.updateOptionsHeight());
        }
    }

    /**
     * Prepares song image DOM element
     */
    setSongImage() {
        if (!this.state.selectedSong) {
            return;
        }

        // Render everything that needs no network first so title, artists and
        // lyrics appear immediately.
        this.setSongInfo();
        this.setSongLyrics(
            Array.from(document.querySelectorAll('.select-line.selected')).map(
                (selectLine) => Number(selectLine.dataset.index)
            )
        );
        // The background is random, so the text color has to follow it —
        // otherwise a dark draw lands almost-black text on an almost-black card.
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.setSongImageColor(randomColor);
        this.setSongTextColor(contrastingTextColor(randomColor));
        if (this.customColorInput) {
            this.customColorInput.value = randomColor;
        }
        if (this.textCustomColorInput) {
            this.textCustomColorInput.value = this.currentTextColor;
        }

        // Load the album cover in the background; re-render the blurred
        // backdrop once it arrives instead of blocking the whole screen on it.
        this.coverBase64 = null;
        const song = this.state.selectedSong;
        const coverImg = document.querySelector('.song-image > .header > img');
        coverImg?.classList.remove('cover-loaded');
        if (song.albumCoverUrl) {
            this.setBase64Image(
                song.albumCoverUrl,
                '.song-image > .header > img'
            )
                .then((base64) => {
                    // Ignore if the user navigated to a different song meanwhile.
                    if (this.state.selectedSong !== song) {
                        return;
                    }
                    this.coverBase64 = base64;
                    coverImg?.classList.add('cover-loaded');
                    this.renderImageBackground();
                })
                .catch((err) => {
                    console.error('Failed to load album cover', err);
                });
        }
    }

    /**
     * Sets song image's background color and second-layer color variable.
     * @param {string} background
     */
    setSongImageColor(background) {
        this.currentBgColor = background;
        if (this.songImage) {
            this.songImage.style.backgroundColor = background;
        }
        if (this.songImageWrap) {
            this.songImageWrap.style.setProperty('--song-bg-second', background);
        }
        this.updateInfoBackground();
        this.renderImageBackground();
    }

    /**
     * Tints the song info row with the current background color at the
     * configured opacity (fully transparent by default).
     */
    updateInfoBackground() {
        if (!this.songImage || !this.infoBgSlider) {
            return;
        }

        const opacity = Number(this.infoBgSlider.value) / 100;
        this.songImage.classList.toggle('info-bg', opacity > 0);
        this.songImage.style.setProperty(
            '--song-info-bg',
            hexToRgba(this.currentBgColor, opacity)
        );
    }

    /**
     * Moves the service tag to the selected position. "In song info" nests it
     * inside the info row's text column; the others keep it as a card-level
     * row whose order is decided by CSS.
     */
    updateTagPosition() {
        if (!this.songImage || !this.tagPositionSelect || !this.tagContainer) {
            return;
        }

        const position = this.tagPositionSelect.value;
        this.songImage.classList.remove(
            'tag-pos-bottom',
            'tag-pos-top',
            'tag-pos-info'
        );
        this.songImage.classList.add(`tag-pos-${position}`);

        const infoText = this.songImage.querySelector('.header > div');
        const parent = position === 'info' ? infoText : this.songImage;
        if (parent && this.tagContainer.parentElement !== parent) {
            parent.appendChild(this.tagContainer);
        }
    }

    /**
     * Sets song image's text color and author color.
     * @param {string} color
     */
    setSongTextColor(color) {
        this.currentTextColor = color;
        if (!this.songImage) return;
        this.songImage.style.setProperty('--song-text-color', color);
        this.songImage.style.setProperty('--song-author-color', hexToRgba(color, 0.6));
        this.updateServiceTag();
    }

    /**
     * Renders album cover as a blurred + tinted background image.
     * Pre-renders to an offscreen canvas so html2canvas exports a static raster.
     */
    renderImageBackground() {
        if (!this.songImage) return;

        if (!this.coverBase64) {
            this.songImage.style.backgroundImage = '';
            this.backdropCanvas = null;
            this.songImageWrap?.style.removeProperty('--song-backdrop-image');
            return;
        }

        const img = new Image();
        img.src = this.coverBase64;
        img.onload = () => {
            const cardW = this.songImage.offsetWidth || img.width;
            const blurPx = (this.shadowBlur ?? 0) * (img.width / cardW);
            const canvas = this.renderBlurredCover(img, blurPx);
            const ctx = canvas.getContext('2d');

            // Keep an untinted copy: the backdrop shows the plain blurred
            // cover so the tinted card still reads as a separate layer on it.
            this.backdropCanvas = document.createElement('canvas');
            this.backdropCanvas.width = canvas.width;
            this.backdropCanvas.height = canvas.height;
            this.backdropCanvas.getContext('2d').drawImage(canvas, 0, 0);
            this.songImageWrap?.style.setProperty(
                '--song-backdrop-image',
                `url("${this.backdropCanvas.toDataURL()}")`
            );

            const opacity = this.shadowOpacity ?? 0;
            if (opacity > 0) {
                ctx.fillStyle = hexToRgba(this.currentBgColor, opacity);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            this.songImage.style.backgroundImage = `url("${canvas.toDataURL()}")`;
            this.songImage.style.backgroundSize = 'cover';
            this.songImage.style.backgroundPosition = 'center';
        };
    }

    /**
     * Blurs the cover into a canvas of the image's own size, without the faded
     * edges a plain `filter: blur()` leaves behind. The cover is drawn zoomed
     * ~10% into an oversized canvas whose padding is filled by stretching the
     * outermost pixel row/column outwards (edge clamping), so the blur always
     * samples real pixels; the padding is cropped off afterwards. The padding
     * scales with the radius, which a fixed zoom cannot do — that is why the
     * background color used to bleed through the edges above ~16px of blur.
     * @param {HTMLImageElement} img
     * @param {number} blurPx
     * @returns {HTMLCanvasElement}
     */
    renderBlurredCover(img, blurPx) {
        const zoom = 1.1;
        const dw = img.width * zoom;
        const dh = img.height * zoom;
        const offsetX = (img.width - dw) / 2;
        const offsetY = (img.height - dh) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (blurPx <= 0) {
            ctx.drawImage(img, offsetX, offsetY, dw, dh);
            return canvas;
        }

        // A canvas blur fades out over roughly three times its radius.
        const pad = Math.ceil(blurPx * 3);
        const padded = document.createElement('canvas');
        padded.width = img.width + pad * 2;
        padded.height = img.height + pad * 2;
        const paddedCtx = padded.getContext('2d');
        paddedCtx.drawImage(img, pad + offsetX, pad + offsetY, dw, dh);

        // Clamp the drawn rect's edges out to the canvas borders: the sides
        // first, then full-width top/bottom rows, which also fill the corners.
        const left = Math.max(0, Math.round(pad + offsetX));
        const top = Math.max(0, Math.round(pad + offsetY));
        const right = Math.min(padded.width, Math.round(pad + offsetX + dw));
        const bottom = Math.min(padded.height, Math.round(pad + offsetY + dh));
        const bandHeight = bottom - top;

        if (left > 0) {
            paddedCtx.drawImage(
                padded, left, top, 1, bandHeight,
                0, top, left, bandHeight
            );
        }

        if (right < padded.width) {
            paddedCtx.drawImage(
                padded, right - 1, top, 1, bandHeight,
                right, top, padded.width - right, bandHeight
            );
        }

        if (top > 0) {
            paddedCtx.drawImage(
                padded, 0, top, padded.width, 1,
                0, 0, padded.width, top
            );
        }

        if (bottom < padded.height) {
            paddedCtx.drawImage(
                padded, 0, bottom - 1, padded.width, 1,
                0, bottom, padded.width, padded.height - bottom
            );
        }

        // Blur the padded canvas whole (blurring it while cropping would only
        // reintroduce the faded border), then keep the center.
        const blurred = document.createElement('canvas');
        blurred.width = padded.width;
        blurred.height = padded.height;
        const blurredCtx = blurred.getContext('2d');
        blurredCtx.filter = `blur(${blurPx}px)`;
        blurredCtx.drawImage(padded, 0, 0);
        blurredCtx.filter = 'none';

        ctx.drawImage(
            blurred, pad, pad, img.width, img.height,
            0, 0, img.width, img.height
        );
        return canvas;
    }

    /**
     * Debounced wrapper around renderImageBackground for slider events.
     */
    _debouncedRenderBg() {
        clearTimeout(this._bgRenderTimer);
        this._bgRenderTimer = setTimeout(() => this.renderImageBackground(), 80);
    }

    /**
     * Sets song image's width
     * @param {number} width - Width in pixels
     */
    setSongImageWidth(width) {
        if (!this.songImage) {
            return;
        }

        // The wrapper carries the scale so the previewed backdrop shrinks with
        // the card instead of staying at the unscaled size.
        const scaled = this.songImageWrap ?? this.songImage;

        const numericWidth = Number(width);
        this.songImage.style.setProperty(
            '--song-image-width',
            `${numericWidth}px`
        );

        const fullHeight = this.songImage.offsetHeight;
        const screen = this.songImage.closest('.lyrics-image-screen');

        if (!screen) {
            scaled.style.setProperty('--song-image-scale', 1);
            scaled.style.marginBottom = '0px';
            return;
        }

        const screenWidth = screen.clientWidth;
        const horizontalMargin = 32;
        const maxVisualWidth = Math.max(screenWidth - horizontalMargin, 0);

        const scale =
            numericWidth > 0 && maxVisualWidth > 0
                ? Math.min(1, maxVisualWidth / numericWidth)
                : 1;

        scaled.style.setProperty('--song-image-scale', scale);

        const marginBottom = fullHeight * (scale - 1);
        scaled.style.marginBottom = `${marginBottom}px`;
    }

    /**
     * Removes the fit-to-screen scale from a cloned document before export.
     * html2canvas reads every bound (the card's own, and each word's) straight
     * from the clone, but draws text at the unscaled computed font size, so a
     * shrunk preview exports with the words crammed together. The transform is
     * preview-only anyway — the export always wants the card at full size.
     * @param {Document} clonedDoc - Document passed to html2canvas' onclone
     */
    undoPreviewScale(clonedDoc) {
        const scaled =
            clonedDoc.querySelector('.song-image-wrap') ??
            clonedDoc.querySelector('.song-image');

        if (scaled) {
            scaled.style.setProperty('--song-image-scale', 1);
            scaled.style.marginBottom = '0px';
        }
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

    updateServiceTag() {
        if (!this.songImage || !this.serviceTagSelect) {
            return;
        }

        if (this.customTagActive) {
            return;
        }

        const tagContainer = this.songImage.querySelector('.spotify');
        const img = tagContainer
            ? tagContainer.querySelector('img')
            : null;

        const value = this.serviceTagSelect.value;

        this.songImage.classList.remove('spotify-tag', 'apple-tag');

        if (!img) {
            return;
        }

        if (value === 'none') {
            img.setAttribute('src', '');
            return;
        }

        this.songImage.classList.add('spotify-tag');

        const isLight = isLightColor(this.currentTextColor ?? '#000000');

        if (value === 'spotify') {
            this.songImage.classList.remove('apple-tag');
            this.setBase64Image(
                SPOTIFY_LOGO,
                '.song-image .spotify > img',
                isLight ? 255 : 0
            );
        } else if (value === 'apple') {
            this.songImage.classList.add('apple-tag');
            this.setBase64Image(
                APPLE_MUSIC_LOGO,
                '.song-image .spotify > img',
                isLight ? 255 : 0
            );
        }
    }

    applyCustomServiceTagImage() {
        if (!this.songImage || !this.serviceTagFileInput) {
            return;
        }

        const tagContainer = this.songImage.querySelector('.spotify');
        const img = tagContainer
            ? tagContainer.querySelector('img')
            : null;

        if (!img || !this.serviceTagFileInput.files?.length) {
            return;
        }

        const file = this.serviceTagFileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                img.setAttribute('src', reader.result);
                this.songImage.classList.add('spotify-tag');
                this.songImage.classList.remove('apple-tag');
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * Replaces the album cover with a user-uploaded image. The file is read
     * as a base64 data URI (inherently CORS-safe, so it feeds straight into
     * the existing export pipeline) and reused as the blurred backdrop.
     * @param {File} file
     */
    applyCustomCoverArt(file) {
        if (!this.coverImg || !file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return;
            }
            this.coverBase64 = reader.result;
            this.coverImg.setAttribute('src', reader.result);
            this.coverImg.classList.add('cover-loaded');
            this.renderImageBackground();
        };
        reader.readAsDataURL(file);
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

        // Strip preview-only class so it doesn't contaminate the export
        const preview = this.songImageWrap;
        const hadPreview =
            preview?.classList.contains('additional-bg-preview') ?? false;
        if (hadPreview) {
            preview.classList.remove('additional-bg-preview');
        }

        let canvas = await html2canvas(this.songImage, {
            backgroundColor: null,
            scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR,
            onclone: (clonedDoc) => this.undoPreviewScale(clonedDoc),
        });

        if (hadPreview) {
            preview.classList.add('additional-bg-preview');
        }

        if (this.songImage.classList.contains('additional-bg')) {
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
        const backgroundColor = this.currentBgColor;

        const borderRadius =
            (this.shadowCornerRadius ?? BACKGROUND_SHADOW_BORDER_RADIUS) *
            window.devicePixelRatio *
            DOWNLOAD_SCALING_FACTOR;

        const shadowBlur =
            (this.shadowBlur ?? BACKGROUND_SHADOW_BLUR) *
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

        if (
            this.songImageWrap?.classList.contains('backdrop-cover') &&
            this.backdropCanvas
        ) {
            this.drawCover(shadowContext, this.backdropCanvas, shadowCanvas);
        }

        const opacity = this.shadowOpacity ?? 0.25;
        shadowContext.fillStyle = `rgba(0, 0, 0, ${opacity})`;
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
     * Draws source centered over the whole target area, cropping the overflow
     * like CSS `background-size: cover`.
     * @param {CanvasRenderingContext2D} context
     * @param {HTMLCanvasElement} source
     * @param {HTMLCanvasElement} target
     */
    drawCover(context, source, target) {
        const scale = Math.max(
            target.width / source.width,
            target.height / source.height
        );
        const width = source.width * scale;
        const height = source.height * scale;

        context.drawImage(
            source,
            (target.width - width) / 2,
            (target.height - height) / 2,
            width,
            height
        );
    }

    /**
     * Fetches url, converts to base64, optionally recolors all opaque pixels to newColor,
     * and sets the result as src on imgSelector. Returns the raw base64 if newColor is null.
     * @param {string} url
     * @param {string} imgSelector
     * @param {number | null} newColor
     * @returns {Promise<string | undefined>}
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

        if (newColor === null) {
            document
                .querySelector(imgSelector)
                .setAttribute('src', base64);
            return base64;
        }

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
