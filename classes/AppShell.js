class AppShell {
    constructor() {
        /** @type {NodeListOf<Element>} */
        this.errorTexts = document.querySelectorAll('.error');
        /** @type {NodeListOf<Element>} */
        this.searchingTexts = document.querySelectorAll('.searching');
        /** @type {NodeListOf<Element>} */
        this.screens = document.querySelectorAll('.lyrics-image-screen');

        /** @type {Element | null} */
        this.toggleDarkMode = document.querySelector('#dark-mode-toggle');
        /** @type {HTMLSelectElement | null} */
        this.fontLangSelect = document.querySelector('#font-lang');

        this.registerGlobalListeners();
        this.bootstrapTheme();
    }

    registerGlobalListeners() {
        if (this.toggleDarkMode) {
            this.toggleDarkMode.addEventListener('click', () => {
                const nextTheme = document.body.classList.contains('dark-mode')
                    ? 'light'
                    : 'dark';
                this.setTheme(nextTheme);
            });
        }

        if (this.fontLangSelect) {
            this.fontLangSelect.addEventListener('change', (e) => {
                document.documentElement.lang = e.target.value;
            });
        }
    }

    bootstrapTheme() {
        const initialTheme =
            localStorage.getItem('theme') ??
            (window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light');

        this.setTheme(initialTheme);
    }

    /**
     * Displays an error message with provided html
     * @param {string} html
     */
    throwError(html) {
        this.errorTexts.forEach((element) => {
            element.innerHTML = html;
            element.classList.remove('hidden');
        });
    }

    /**
     * Hides the error message
     */
    hideError() {
        this.errorTexts.forEach((element) => {
            element.classList.add('hidden');
        });
    }

    /**
     * Displays a searching text
     * @param {string} text
     */
    displaySearching(text) {
        this.searchingTexts.forEach((element) => {
            element.textContent = text;
            element.classList.remove('hidden');
        });
    }

    /**
     * Hides the searching text
     */
    hideSearching() {
        this.searchingTexts.forEach((element) => {
            element.classList.add('hidden');
        });
    }

    /**
     * Changes the visible wizard screen
     * @param {number} number
     */
    displayScreen(number) {
        this.screens.forEach((screen) => {
            const screenNumber = Number(screen.dataset.number);

            if (screenNumber < number) {
                screen.classList.add('hidden');
                screen.classList.add('left');
            } else if (screenNumber === number) {
                screen.classList.remove('hidden');
                screen.classList.remove('left');
            } else {
                screen.classList.add('hidden');
                screen.classList.remove('left');
            }
        });
    }

    /**
     * Sets color theme
     * @param {string} theme
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }
}

