const Octokit = require('@octokit/rest');
const firstPR = require('./firstPR');

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
            `repo:${this.repo}`,
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
