const Octokit = require('@octokit/rest');
const chalk = require('chalk');
const firstPR = require('./firstPR');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class firstPRs {
    constructor(opts) {
        this.repo = opts.repo;
        this.octokit = new Octokit({auth: opts.githubToken});
        this.mergedOnly = opts.mergedOnly || true;
        this.prCount = opts.prCount || 10;
        this.newerThan = opts.newerThan || null;
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
        if (this.newerThan) parts.push(`created:>${this.newerThan}`);
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
        if (!prs.length) return;
        process.stdout.write(chalk.blue(`> ${prs.length} `));
        for (let i = 0; i < prs.length; i++) {
            try {
                const firstPr = new firstPR(prs[i]);
                await firstPr.getContribState();
                if (firstPr.first) {
                    this.firstPrs[firstPr.data.id] = firstPr;
                    process.stdout.write(chalk.bgGreenBright.blue.bold('.'));
                } else {
                    process.stdout.write(chalk.yellow('.'));
                }
            } catch {
                process.stdout.write(chalk.red('.'));
            }
            await sleep(500);
        }
        process.stdout.write('\n');
    }
}

module.exports = firstPRs;
