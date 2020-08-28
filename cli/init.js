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
const { SPLUNK_DASHBOARDS_APP } = require('./constants');
const { initVercelProject } = require('./vercel');

const toFolderName = projectName => projectName.toLowerCase().replace(/[\W_]+/g, '-');

const postInitInstructions = ({ folderName }) => chalk`

{green Project successfully generated in {bold ./${folderName}}}

Next steps:

{yellow $} cd ./${folderName}

{gray # Start developing}

{yellow $} yarn dev

{gray Open a browser at http://localhost:3000}
`;

async function generateDashboards(selectedDashboards, splunkdInfo, destFolder) {
    await generate(SPLUNK_DASHBOARDS_APP, selectedDashboards, splunkdInfo, destFolder);
}

async function initNewProject() {
    console.log(`Welcome to DASHPUB, let's setup a new project.\n`);

    const projectName = await prompts.string('Project name:');
    const folderName = await prompts.string('Folder name:', {
        default: toFolderName(projectName),
    });

    console.log('\nEnter information to access your dashboards in Splunk Enterprise:');

    const splunkdUrl = await prompts.splunkdUrl();
    const splunkdUser = await prompts.splunkdUsername();
    const splunkdPassword = await prompts.splunkdPassword(splunkdUrl, splunkdUser);

    const splunkdInfo = {
        url: splunkdUrl,
        username: splunkdUser,
        password: splunkdPassword,
    };

    cli.action.start('Loading dashboards');
    const dashboards = await splunkd.listDashboards(SPLUNK_DASHBOARDS_APP, splunkdInfo);
    cli.action.stop(`found ${dashboards.length} dashboards`);

    const selectedDashboards = await prompts.selectDashboards(dashboards);

    console.log(`\nCreating project in ./${folderName}`);
    const srcFolder = path.join(__dirname, '..');
    const destFolder = path.join(process.cwd(), folderName);
    await fs.mkdir(destFolder);

    await fs.copy(path.join(srcFolder, 'template'), destFolder, { recursive: true });
    const copyToDest = (p, opts) => fs.copy(path.join(srcFolder, p), path.join(destFolder, p), opts);
    await copyToDest('yarn.lock');

    await updatePackageJson({ folderName, version: '1.0.0', projectName, splunkdUrl, splunkdUser, selectedDashboards }, { destFolder });
    await writeDotenv({ splunkdUrl, splunkdUser, splunkdPassword }, { destFolder });

    await exec('yarn', ['install'], { cwd: destFolder });
    await generateDashboards(selectedDashboards, splunkdInfo, destFolder);

    await exec('git', ['init'], { cwd: destFolder });
    await exec('git', ['add', '.'], { cwd: destFolder });
    await exec('git', ['commit', '-m', 'initialized dashpub project'], { cwd: destFolder });

    if (await prompts.confirm(`Setup Vercel project?`)) {
        await initVercelProject({ folderName, destFolder, splunkdUrl, splunkdUser, splunkdPassword });
    } else {
        console.log(postInitInstructions({ folderName }));
    }
}

module.exports = {
    initNewProject,
    generateDashboards,
};
