const prompts = require('./prompts');
const { exec, Secret } = require('./exec');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { cli } = require('cli-ux');

const postInitInstructions = ({ folderName }) => chalk`

{green Project successfully generated in {bold ./${folderName}}}

{gray Next steps:}

{yellow $} cd ./${folderName}

{gray {bold.blue 1)} Setup the project with Vercel}

{yellow $} vercel

{gray Follow the steps to set up the project}

{gray {bold.blue 2)} Run locally}

{yellow $} vercel dev --listen 3333

{gray Open a browser at http://localhost:3333}

{gray {bold.blue 3)} Deploy to Vercel:}

{yellow $} vercel --prod

{gray {bold.blue 4)} [optional] Push to a Github repository and set up the Vercel Github Integration

    https://vercel.com/docs/git-integrations/vercel-for-github}
`;

async function initVercelProject({ folderName, destFolder, splunkdUrl, splunkdUser, splunkdPassword = process.env.SPLUNKD_PASSWORD }) {
    const nowSplunkdPasswordSecret = `dashpub-${folderName}-splunkd-password`;

    cli.action.start('Creating vercel.json');
    await fs.writeFile(
        path.join(destFolder, 'vercel.json'),
        JSON.stringify(
            {
                version: 2,
                env: {
                    SPLUNKD_URL: splunkdUrl,
                    SPLUNKD_USER: splunkdUser,
                    SPLUNKD_PASSWORD: `@${nowSplunkdPasswordSecret}`,
                },
            },
            null,
            2
        )
    );
    cli.action.stop();

    await exec('vercel', ['secret', 'add', nowSplunkdPasswordSecret, new Secret(splunkdPassword)]);
    await exec('git', ['add', '.'], { cwd: destFolder });
    await exec('git', ['commit', '-m', 'initialized vercel project'], { cwd: destFolder });

    console.log(postInitInstructions({ folderName }));
}

module.exports = {
    initVercelProject,
};
