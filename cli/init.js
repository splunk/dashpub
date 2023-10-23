#!/usr/bin/env node

/*
Copyright 2020 Splunk Inc. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
//const { SPLUNK_DASHBOARDS_APP } = require('./constants');
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

async function generateDashboards(app, selectedDashboards, splunkdInfo, destFolder) {
    await generate(app, selectedDashboards, splunkdInfo, destFolder);
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

    cli.action.start(`Listing Apps`);
    const applist = await splunkd.listApps(splunkdInfo);
    cli.action.stop(`Found: ${applist.length} apps`);

    const selectedApp = await prompts.selectApps(applist);

    cli.action.start(`Loading dashboards from ${selectedApp} app`);
    const dashboards = await splunkd.listDashboards(selectedApp, splunkdInfo);
    cli.action.stop(`found ${dashboards.length} dashboards`);

    const selectedDashboards = await prompts.selectDashboards(dashboards);

    console.log(`\nCreating project in ./${folderName}`);
    const srcFolder = path.join(__dirname, '..');
    const destFolder = path.join(process.cwd(), folderName);
    await fs.mkdir(destFolder);

    await fs.copy(path.join(srcFolder, 'template'), destFolder, { recursive: true });
    const copyToDest = (p, opts) => fs.copy(path.join(srcFolder, p), path.join(destFolder, p), opts);
    await copyToDest('yarn.lock');

    await updatePackageJson({ folderName, version: '1.0.0', projectName, splunkdUrl, splunkdUser, selectedDashboards, selectedApp }, { destFolder });
    await writeDotenv({ splunkdUrl, splunkdUser, splunkdPassword, selectedApp }, { destFolder });

    await exec('yarn', ['install'], { cwd: destFolder });
    //await generateDashboards(selectedApp, selectedDashboards, splunkdInfo, destFolder);
    await generate(selectedApp, selectedDashboards, splunkdInfo, destFolder);

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
    //generateDashboards,
};
