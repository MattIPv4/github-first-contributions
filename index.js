const chalk = require('chalk');
const firstPRs = require('./src/firstPRs');
const token = require('./token');

const repos = [
    'digitalocean/doctl',
    'digitalocean/godo',
    'digitalocean/droplet_kit',
    'digitalocean/nginxconfig.io',
    'digitalocean/hacktoberfest',
    'digitalocean/go-qemu',
    'digitalocean/go-libvirt',
    'digitalocean/digitalocean-cloud-controller-manager',
    'digitalocean/firebolt',
    'do-community/dns-tool',
    'do-community/kubernetes-tool',
    'do-community/glob-tool',
    'do-community/do-bulma',
    'do-community/do-vue',
    'terraform-providers/terraform-provider-digitalocean',
];

const main = async () => {
    for (let i = 0; i < repos.length; i++) {
        console.log(chalk.bold.blue(repos[i]));
        const firstPrs = new firstPRs({
            repo: repos[i],
            githubToken: token,
            mergedOnly: true,
            prCount: 20,
        });
        await firstPrs.getRecentPRs();
        await firstPrs.getFirstPRs();
        Object.values(firstPrs.firstPrs).forEach(firstPr => {
            console.log(chalk.green(`  ${firstPr.data.html_url}`));
            console.log(chalk.green(`    @${firstPr.data.user.login} | ${firstPr.first}`));
        });
    }
};

main();
