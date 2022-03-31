const chalk = require('chalk');
const firstPRs = require('./src/firstPRs');
const token = require('./token');

const repos = [
    'digitalocean/doctl',
    'digitalocean/doctl-sandbox-plugin ',
    'digitalocean/action-doctl',
    'digitalocean/godo',
    'digitalocean/openapi',
    'digitalocean/droplet_kit',
    'digitalocean/nginxconfig.io',
    'digitalocean/do-markdownit',

    'digitalocean/go-qemu',
    'digitalocean/go-libvirt',
    'digitalocean/go-smbios',
    'digitalocean/go-workers2',
    'digitalocean/go-openvswitch',
    'digitalocean/gocop',

    'digitalocean/digitalocean-cloud-controller-manager',
    'digitalocean/firebolt',
    'digitalocean/clusterlint',
    'digitalocean/captainslog',
    'digitalocean/ceph_exporter',
    'digitalocean/digitalocean-ceph-lab',
    'digitalocean/do-agent',
    'digitalocean/droplet-agent',
    'digitalocean/prometheus-client-c',
    'digitalocean/csi-digitalocean',
    'digitalocean/marketplace-kubernetes',
    'digitalocean/droplet-1-clicks',
    'digitalocean/marketplace-partners',
    'digitalocean/github-changelog-generator',
    'digitalocean/OpenVPN-Pihole',
    'digitalocean/archimedes',
    'digitalocean/omniauth-digitalocean',
    'digitalocean/kartograph',
    'digitalocean/gta',
    'digitalocean/vmtop',
    'digitalocean/doks-debug',
    'digitalocean/databases',
    'digitalocean/container-blueprints',
    'digitalocean/Kubernetes-Starter-Kit-Developers',
    'digitalocean/pgremapper',
    'digitalocean/flipop',

    'digitalocean/terraform-provider-digitalocean',
    'digitalocean/terraform-provider-sendgrid',

    'digitalocean/sample-expressjs',
    'digitalocean/sample-laravel',
    'digitalocean/sample-nuxtjs',
    'digitalocean/sample-flask',
    'digitalocean/sample-react',
    'digitalocean/sample-docker-cobol',
    'digitalocean/sample-dockerfile-fastcgi-perl',
    'digitalocean/sample-dockerfile-fortran',
    'digitalocean/sample-nextjs',
    'digitalocean/sample-dockerfile-static',
    'digitalocean/sample-dockerfile',
    'digitalocean/sample-python',
    'digitalocean/sample-rails',
    'digitalocean/sample-jekyll',
    'digitalocean/sample-php',
    'digitalocean/sample-nodejs',
    'digitalocean/sample-golang',
    'digitalocean/sample-monorepo',
    'digitalocean/sample-hugo',
    'digitalocean/sample-vuejs',
    'digitalocean/sample-gatsby',
    'digitalocean/sample-ruby',
    'digitalocean/sample-html',
    'digitalocean/sample-hexo',
    'digitalocean/sample-sleeper',
    'digitalocean/sample-swift',
    'digitalocean/sample-django',
    'digitalocean/sample-laravel-api',
    'digitalocean/sample-websocket',
    'digitalocean/sample-push-to-deploy-doks',
    'digitalocean/sample-functions-nodejs-helloworld',
    'digitalocean/sample-functions-nodejs-qrcode',
    'digitalocean/sample-functions-nodejs-calculator',
    'digitalocean/sample-functions-golang-helloworld',
    'digitalocean/sample-functions-php-numberstowords',
    'digitalocean/sample-functions-python-helloworld',
    'digitalocean/sample-functions-python-jokes',
    'digitalocean/sample-functions-php-helloworld',

    'do-community/dns-tool',
    'do-community/kubernetes-tool',
    'do-community/glob-tool',
    'do-community/bandwidth-tool',
    'do-community/hub-for-good-list',
    'do-community/available-images',
    'do-community/minify-tool',
    'do-community/diagram-tool',
    'do-community/glob-tool-embed',
    'do-community/dns-tool-embed',
    'do-community/do-moderator-toolbox',
    'do-community/do-bulma',
    'do-community/do-vue',
    'do-community/suggestkit-react',
    'do-community/suggestkit-vue',
    'do-community/suggestkit',
    'do-community/do-disposable',

    'do-community/example-doctl-action',
    'do-community/do-ansible-inventory',
    'do-community/kubectl-doweb',
    'do-community/ansible-playbooks',
    'do-community/creatorlinks',
    'do-community/terraform-ansible-demo',
    'do-community/terraform-sample-digitalocean-architectures',
    'do-community/dolphin',
    'do-community/python-doctl',
    // 'do-community/cloud_haiku',
    // 'do-community/developer-glossary',
];

const date = new Date();
date.setMonth(date.getMonth() - 2);
const newerThan = date.toISOString().split('T')[0];

const main = async () => {
    console.log(chalk.bold.blueBright(`PRs newer than ${newerThan}...\n`));

    for (let i = 0; i < repos.length; i++) {
        const start = Date.now();

        console.log(chalk.bold.blue(repos[i]));
        const firstPrs = new firstPRs({
            repo: repos[i],
            githubToken: token,
            mergedOnly: true,
            newerThan,
            prCount: 30,
        });
        await firstPrs.getRecentPRs();
        await firstPrs.getFirstPRs();
        Object.values(firstPrs.firstPrs).forEach(firstPr => {
            console.log(chalk.green(`  ${firstPr.data.html_url} ${firstPr.data.pull_request.merged_at}`));
            console.log(chalk.green(`    @${firstPr.data.user.login} | ${firstPr.first}`));
        });

        // Ensure we stay below 30reqs/min
        await new Promise(resolve => setTimeout(resolve, (2000 - (Date.now() - start)) * 1.1));
    }
};

main();
