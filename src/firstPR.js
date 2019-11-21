const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class firstPR {
    constructor(pr) {
        this.data = pr;
        this.first = null;
    }

    async getHoverCardURL() {
        // Get full PR HTML page
        const htmlPr = await (await fetch(this.data.html_url)).text();
        const dom = new JSDOM(htmlPr);
        const document = dom.window.document;

        // Get the hovercard PR subject ID
        const subjectTagElm = document.querySelector('meta[name="hovercard-subject-tag"]');
        const subjectTag = subjectTagElm.getAttribute('content');

        // Get the base hovercard URL
        const urlElm = document.querySelector('.pull-discussion-timeline .js-comment-container:first-of-type a.author');
        const url = urlElm.getAttribute('data-hovercard-url');

        // dependabot doesn't have a hovercard
        if (!url) return null;

        // Construct full URL
        return `https://github.com${url}` +
            `&subject=${encodeURIComponent(subjectTag)}` +
            `&current_path=${encodeURIComponent(this.data.html_url.replace('https://github.com', ''))}`
    }

    async getContribState() {
        // Abort if author is member
        if (this.data.author_association === 'MEMBER') return this.first = null;

        // Get the hovercard URL
        const hovercardUrl = await this.getHoverCardURL();
        if (!hovercardUrl) return this.first = null;

        // Fetch the hovercard HTML
        const hovercardHtml = await (await fetch(hovercardUrl, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })).text();

        // Get opened PR line & return
        const found = hovercardHtml.match(/Opened this pull request ?\(?(.*?)\)?\s<\/span>/);
        if (found && found[1]) return this.first = found[1];
        return this.first = null;
    }
}

module.exports = firstPR;
