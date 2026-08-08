class PresetsController {
    /**
     * @param {SongImageController} songImageController
     */
    constructor(songImageController) {
        this.songImageController = songImageController;

        /** @type {HTMLElement | null} */
        this.presetList = document.querySelector('.preset-list');
        /** @type {HTMLElement | null} */
        this.savePresetButton = document.querySelector('#save-preset');

        /** @type {{ name: string, settings: object }[]} */
        this.userPresets = this.loadUserPresets();

        this.renderPresets();
        this.registerListeners();
    }

    registerListeners() {
        if (this.savePresetButton) {
            this.savePresetButton.addEventListener('click', () =>
                this.saveNewPreset()
            );
        }
    }

    /**
     * Reads the user's presets from local storage, ignoring anything that
     * isn't shaped like a preset (hand-edited or half-written storage).
     * @returns {{ name: string, settings: object }[]}
     */
    loadUserPresets() {
        try {
            const stored = JSON.parse(
                localStorage.getItem(PRESETS_STORAGE_KEY)
            );

            if (!Array.isArray(stored)) {
                return [];
            }

            return stored
                .filter(
                    (preset) =>
                        typeof preset?.name === 'string' &&
                        typeof preset?.settings === 'object' &&
                        preset.settings !== null
                )
                .map((preset) => ({
                    name: preset.name,
                    settings: preset.settings,
                }));
        } catch (err) {
            console.error('Failed to read stored presets', err);
            return [];
        }
    }

    storeUserPresets() {
        try {
            localStorage.setItem(
                PRESETS_STORAGE_KEY,
                JSON.stringify(this.userPresets)
            );
        } catch (err) {
            console.error('Failed to store presets', err);
        }
    }

    /**
     * Rebuilds the list: built-in presets first, then the user's own.
     */
    renderPresets() {
        if (!this.presetList) {
            return;
        }

        this.presetList.innerHTML = '';

        BUILT_IN_PRESETS.forEach((preset) => {
            this.presetList.appendChild(this.buildPreset(preset, false));
        });
        this.userPresets.forEach((preset) => {
            this.presetList.appendChild(this.buildPreset(preset, true));
        });

        this.songImageController.updateOptionsHeight();
    }

    /**
     * @param {{ name: string, settings: object }} preset
     * @param {boolean} editable - Whether to add rename/remove buttons
     * @returns {HTMLElement}
     */
    buildPreset(preset, editable) {
        const container = document.createElement('div');
        container.classList.add('preset');

        const apply = document.createElement('button');
        apply.classList.add('preset-apply');
        apply.textContent = preset.name;
        apply.addEventListener('click', () => this.applyPreset(preset, container));
        container.appendChild(apply);

        if (editable) {
            container.appendChild(
                this.buildPresetAction('edit', () => this.renamePreset(preset))
            );
            container.appendChild(
                this.buildPresetAction('delete', () => this.removePreset(preset))
            );
        }

        return container;
    }

    /**
     * @param {string} icon - Material symbol name
     * @param {() => void} onClick
     * @returns {HTMLElement}
     */
    buildPresetAction(icon, onClick) {
        const button = document.createElement('button');
        button.classList.add('preset-action', 'material-symbols-outlined');
        button.textContent = icon;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * @param {{ name: string, settings: object }} preset
     * @param {HTMLElement} container
     */
    applyPreset(preset, container) {
        this.songImageController.applySettings(preset.settings);

        this.presetList
            ?.querySelectorAll('.preset.active')
            .forEach((element) => element.classList.remove('active'));
        container.classList.add('active');
    }

    saveNewPreset() {
        const name = this.askForName(
            'Name for the new preset',
            `My preset ${this.userPresets.length + 1}`
        );

        if (name === null) {
            return;
        }

        this.userPresets.push({
            name,
            settings: this.songImageController.getSettings(),
        });
        this.storeUserPresets();
        this.renderPresets();
    }

    /**
     * @param {{ name: string, settings: object }} preset
     */
    renamePreset(preset) {
        const name = this.askForName('New name for the preset', preset.name);

        if (name === null) {
            return;
        }

        preset.name = name;
        this.storeUserPresets();
        this.renderPresets();
    }

    /**
     * @param {{ name: string, settings: object }} preset
     */
    removePreset(preset) {
        if (!window.confirm(`Remove the "${preset.name}" preset?`)) {
            return;
        }

        this.userPresets = this.userPresets.filter(
            (userPreset) => userPreset !== preset
        );
        this.storeUserPresets();
        this.renderPresets();
    }

    /**
     * @param {string} message
     * @param {string} fallback - Used when the name is left empty
     * @returns {string | null} null when the user cancels
     */
    askForName(message, fallback) {
        const name = window.prompt(message, fallback);
        return name === null ? null : name.trim() || fallback;
    }
}
