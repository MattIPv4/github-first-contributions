const Octokit = require('@octokit/rest');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const token = require('./token');
const octokit = Octokit({auth: token});

const repos = [
    'digitalocean/doctl',
    'digitalocean/godo',
    'digitalocean/droplet_kit',
    'digitalocean/nginxconfig.io',
    'do-community/dns-tool',
    'do-community/kubernetes-tool',
    'do-community/do-bulma',
    'do-community/do-vue',
    'terraform-providers/terraform-provider-digitalocean',
    'raise-dev/hacktoberfest',
];

const getRecentPRs = async repo => {
    const parts = [
        'is:pr',
        'is:merged',
        'is:public',
        `repo:${repo}`
    ];
    return await octokit.search.issuesAndPullRequests({
        q: parts.join(' '),
        sort: 'created',
        order: 'desc',
        per_page: 10,
    });
};

const getPRContribState = async pr => {
    // Abort if author is member
    if (pr.author_association === 'MEMBER') return null;

    const htmlPr = await (await fetch(pr.html_url)).text();
    const dom = new JSDOM(htmlPr);

    // Get the hovercard PR subject ID
    const hovercardSubjectTag = dom.window.document.querySelector('meta[name="hovercard-subject-tag"]').getAttribute('content');

    // Get the base hovercard URL
    const hovercardUrl = dom.window.document.querySelector('.pull-discussion-timeline .js-comment-container:first-of-type a.author').getAttribute('data-hovercard-url');

    // Create full hovercard URL & fetch
    const hovercard = `https://github.com${hovercardUrl}&subject=${encodeURIComponent(hovercardSubjectTag)}&current_path=${encodeURIComponent(pr.html_url.replace('https://github.com', ''))}`;
    const htmlCard = await (await fetch(hovercard, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })).text();

    // Get opened PR line & return
    const found = htmlCard.match(/Opened this pull request ?\(?(.*?)\)?\s<\/span>/);
    if (found && found[1]) return found[1];
    return null;
};

const main = async () => {
    for (let i = 0; i < repos.length; i++) {
        console.log(repos[i]);
        const data = await getRecentPRs(repos[i]);
        const prs = data.data.items;
        for (let j = 0; j < prs.length; j++) {
            const first = await getPRContribState(prs[j]);
            if (first) {
                console.log(prs[j].html_url);
                console.log(`  @${prs[j].user.login} | ${first}`);
            }
        }
    }
};

main();
