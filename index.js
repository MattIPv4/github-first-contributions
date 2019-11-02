const firstPRs = require('./src/firstPRs');
const token = require('./token');

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

const main = async () => {
    for (let i = 0; i < repos.length; i++) {
        console.log(repos[i]);
        const firstPrs = new firstPRs({
            repo: repos[i],
            githubToken: token,
            mergedOnly: true,
            prCount: 15,
        });
        await firstPrs.getRecentPRs();
        await firstPrs.getFirstPRs();
        Object.values(firstPrs.firstPrs).forEach(firstPr => {
            console.log(`  ${firstPr.data.html_url}`);
            console.log(`    @${firstPr.data.user.login} | ${firstPr.first}`);
        });
    }
};

main();
