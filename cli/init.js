#!/usr/bin/env node

const prompts = require('./prompts');
const splunkd = require('./splunkd');
const { cli } = require('cli-ux');
const fs = require('fs-extra');
const path = require('path');
const { exec, Secret } = require('./exec');
const { generate } = require('./builddash');
const chalk = require('chalk');
const { updatePackageJson } = require('./pkgjson');
const { writeDotenv } = require('./env');
const { SPLUNK_UDF_APP } = require('./constants');

const toFolderName = projectName => projectName.toLowerCase().replace(/[\W_]+/g, '-');

const postInitInstructions = ({ folderName }) => chalk`

{green Project successfully generated in {bold ./${folderName}}}

Next steps:

{yellow $} cd ${folderName}

{gray 1) Setup the project with Now}

{yellow $} now
{gray Follow the steps to set up the project}

{gray 2) Run locally}

{yellow $} now dev --listen 3333

{gray Open a browser at http://localhost:3333}

{gray 3) Deploy to now.sh:}

{yellow $} now --prod

{gray 4) Push to github repository and set up the Now github integration}

`;

async function generateDashboards(selectedDashboards, splunkdInfo, destFolder) {
    await generate(SPLUNK_UDF_APP, selectedDashboards, splunkdInfo, destFolder);
}

async function initNewProject() {
    console.log(`Welcome to UDFPUB, let's setup a new project.\n`);

    const projectName = await prompts.string('Project name:');
    const folderName = await prompts.string('Folder name:', {
        default: toFolderName(projectName),
    });

    console.log('\nEnter information to access your dashbaords in Splunk Enterprise:');

    const splunkdUrl = await prompts.splunkdUrl();
    const splunkdUser = await prompts.splunkdUsername();
    const splunkdPassword = await prompts.splunkdPassword(splunkdUrl, splunkdUser);

    const splunkdInfo = {
        url: splunkdUrl,
        username: splunkdUser,
        password: splunkdPassword,
    };

    cli.action.start('Loading dashbaords');
    const dashboards = await splunkd.listDashboards(SPLUNK_UDF_APP, splunkdInfo);
    cli.action.stop(`found ${dashboards.length} UDF dashboards`);

    const selectedDashboards = await prompts.selectDashboards(dashboards);

    console.log(`\nCreating project in folder ${folderName}`);
    const srcFolder = path.join(__dirname, '..');
    const destFolder = path.join(process.cwd(), folderName);
    await fs.mkdir(destFolder);

    await fs.copy(path.join(srcFolder, 'template'), destFolder, { recursive: true });
    const copyToDest = (p, opts) => fs.copy(path.join(srcFolder, p), path.join(destFolder, p), opts);
    await copyToDest('yarn.lock');

    await updatePackageJson({ folderName, version: '1.0.0', projectName, splunkdUrl, splunkdUser, selectedDashboards }, { destFolder });
    await writeDotenv({ splunkdUrl, splunkdUser, splunkdPassword }, { destFolder });

    const nowSplunkdPasswordSecret = `udfpub-${folderName}-splunkd-password`;

    await fs.writeFile(
        path.join(destFolder, 'now.json'),
        JSON.stringify(
            {
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

    await exec('yarn', ['install'], { cwd: destFolder });
    await generateDashboards(selectedDashboards, splunkdInfo, destFolder);

    await exec('git', ['init'], { cwd: destFolder });
    await exec('git', ['add', '.'], { cwd: destFolder });
    await exec('git', ['commit', '-m', 'initialized udfpub project'], { cwd: destFolder });

    if (await prompts.confirm(`Create now.sh secret [${nowSplunkdPasswordSecret}] for splunk password?`)) {
        await exec('now', ['secret', 'add', nowSplunkdPasswordSecret, new Secret(splunkdPassword)]);
    }

    console.log(postInitInstructions({ folderName }));
}

module.exports = {
    initNewProject,
    generateDashboards,
};
