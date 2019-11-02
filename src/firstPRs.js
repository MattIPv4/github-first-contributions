const Octokit = require('@octokit/rest');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class firstPR {
    constructor(pr) {
        this.data = pr;
        this.first = null;
    }

    async getContribState() {
        // Abort if author is member
        if (this.data.author_association === 'MEMBER') return this.first = null;

        const htmlPr = await (await fetch(this.data.html_url)).text();
        const dom = new JSDOM(htmlPr);
        const document = dom.window.document;

        // Get the hovercard PR subject ID
        const hovercardSubjectTag = document.querySelector('meta[name="hovercard-subject-tag"]').getAttribute('content');

        // Get the base hovercard URL
        const hovercardUrl = document.querySelector('.pull-discussion-timeline .js-comment-container:first-of-type a.author').getAttribute('data-hovercard-url');

        // Create full hovercard URL & fetch
        const hovercard = `https://github.com${hovercardUrl}&subject=${encodeURIComponent(hovercardSubjectTag)}&current_path=${encodeURIComponent(this.data.html_url.replace('https://github.com', ''))}`;
        const htmlCard = await (await fetch(hovercard, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })).text();

        // Get opened PR line & return
        const found = htmlCard.match(/Opened this pull request ?\(?(.*?)\)?\s<\/span>/);
        if (found && found[1]) return this.first = found[1];
        return this.first = null;
    }
}

class firstPRs {
    constructor(opts) {
        this.repo = opts.repo;
        this.octokit = new Octokit({auth: opts.githubToken});
        this.mergedOnly = opts.mergedOnly || true;
        this.prCount = opts.prCount || 10;
        this.prs = {};
        this.firstPrs = {};
    }

    async getRecentPRs() {
        const parts = [
            'is:pr',
            'is:public',
            `repo:${this.repo}`
        ];
        if (this.mergedOnly) parts.push('is:merged');
        const data = await this.octokit.search.issuesAndPullRequests({
            q: parts.join(' '),
            sort: 'created',
            order: 'desc',
            per_page: this.prCount,
        });
        data.data.items.forEach(pr => {
            this.prs[pr.id] = pr;
        });
    }

    async getFirstPRs () {
        const prs = Object.values(this.prs);
        for (let i = 0; i < prs.length; i++) {
            const firstPr = new firstPR(prs[i]);
            await firstPr.getContribState();
            if (firstPr.first) this.firstPrs[firstPr.data.id] = firstPr;
        }
    }
}

module.exports = firstPRs;
