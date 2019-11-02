const Octokit = require('@octokit/rest');
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
        `repo:${repo}`
    ];
    return (await octokit.search.issuesAndPullRequests({
        q: parts.join(' '),
        sort: 'created',
        order: 'desc',
        per_page: 25,
    })).data.items;
};

const main = async () => {
    for (let i = 0; i < repos.length; i++) {
        console.log(await getRecentPRs(repos[i]));
    }
};

main();
