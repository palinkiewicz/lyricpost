class Lyric {
    /**
     * @param {string} lyric
     */
    constructor(lyric) {
        const timeMatch = lyric.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);

        /** @type {number?} */
        this.time = timeMatch
            ? (parseInt(timeMatch[1], 10) * 60 * 1000) + 
                (parseInt(timeMatch[2], 10) * 1000) + 
                (parseInt(timeMatch[3], 10) * 10)
            : null;

        /** @type {string} */
        this.text = timeMatch
            ? lyric.substring(timeMatch[0].length).trim()
            : lyric;
    }
}