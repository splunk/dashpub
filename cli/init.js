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
const { SPLUNK_DASHBOARDS_APP } = require('./constants');
const { initVercelProject } = require('./vercel');

require('dotenv').config();

const toFolderName = (projectName) => projectName.toLowerCase().replace(/[\W_]+/g, '-');

const postInitInstructions = ({ folderName }) => chalk`

{green Project successfully generated in {bold ./${folderName}}}

Next steps:

{yellow $} cd ./${folderName}

{gray # Start developing}

{yellow $} yarn dev

{gray Open a browser at http://localhost:3000}
`;

async function generateDashboards(selectedDashboards, app, splunkdInfo, destFolder) {
    await generate(app, selectedDashboards, splunkdInfo, destFolder);
}

async function parseDashboardsAndTagsEnv(dashboards) {
    let selectedDashboards = [];
    let dashboardTagMap = {};

    if (process.env.DASHPUB_DASHBOARDS) {
        const dashboardEntries = process.env.DASHPUB_DASHBOARDS.split(',');
        dashboardEntries.forEach((entry) => {
            const [dashboard, tags] = entry.split(/\[(.*?)\]/).filter(Boolean); // Split and remove empty strings.
            selectedDashboards.push(dashboard);
            if (tags) {
                dashboardTagMap[dashboard] = tags.split('|');
            } else {
                dashboardTagMap[dashboard] = []; // No tags for this dashboard.
            }
        });
    } else {
        selectedDashboards = await prompts.selectDashboards(dashboards); // Assuming this is a valid function call.
        // You might need to adjust this to ensure it populates the dashboardTagMap correctly based on your prompts logic.
    }

    return { selectedDashboards, dashboardTagMap };
}

async function initNewProject() {
    console.log(`Welcome to DASHPUB, let's setup a new project.\n`);
    let configObj,
        projectName,
        folderName,
        splunkdUrl,
        splunkdToken,
        splunkdUser,
        selectedApp,
        selectedDashboards,
        splunkdInfo,
        splunkdPassword;
    if (process.env.DASHPUB_CONFIGFILE) {
        try {
            configObj = await fs.readJson(process.env.DASHPUB_CONFIGFILE);
            console.log(configObj);
        } catch (err) {
            console.error(err);
        }
        console.log(configObj);
        projectName = configObj.dashpub.projectName;
        folderName = 'app';
        splunkdUrl = configObj.dashpub.splunkd.url;
        splunkdToken = process.env.SPLUNKD_TOKEN;
        splunkdInfo = {
            url: splunkdUrl,
            token: splunkdToken,
        };
        splunkdUser = await splunkd.getUsername(splunkdInfo);
        selectedApp = configObj.dashpub.app;
        selectedDashboards = configObj.dashpub.dashboards;
    } else {
        projectName = process.env.DASHPUB_PROJECTNAME ? process.env.DASHPUB_PROJECTNAME : await prompts.string('Project name:');
        folderName = process.env.DASHPUB_FOLDERNAME
            ? process.env.DASHPUB_FOLDERNAME
            : await prompts.string('Folder name:', {
                  default: toFolderName(projectName),
              });

        if (!process.env.SPLUNKD_URL) console.log('\nEnter information to access your dashboards in Splunk Enterprise:');

        splunkdUrl = process.env.SPLUNKD_URL ? process.env.SPLUNKD_URL : await prompts.splunkdUrl();
        splunkdToken = process.env.SPLUNKD_TOKEN ? process.env.SPLUNKD_TOKEN : await prompts.splunkdToken(splunkdUrl);

        if (!splunkdToken) {
            splunkdUser = process.env.SPLUNKD_USER ? process.env.SPLUNKD_USER : await prompts.splunkdUsername();
            splunkdPassword = process.env.SPLUNKD_PASSWORD
                ? process.env.SPLUNKD_PASSWORD
                : await prompts.splunkdPassword(splunkdUrl, splunkdUser);
            splunkdInfo = {
                url: splunkdUrl,
                username: splunkdUser,
                password: splunkdPassword,
            };
        } else {
            splunkdInfo = {
                url: splunkdUrl,
                token: splunkdToken,
            };
            splunkdUser = await splunkd.getUsername(splunkdInfo);
            splunkdPassword = '';
        }
        cli.action.start(`Loading apps`);
        const apps = await splunkd.listApps(splunkdInfo);
        cli.action.stop(`found ${apps.length} apps`);
        appNames = Object.entries(apps).map(([key, app]) => app['name']);

        selectedApp =
            process.env.DASHPUB_APP && appNames.includes(process.env.DASHPUB_APP) ? process.env.DASHPUB_APP : await prompts.selectApp(apps);

        cli.action.start(`Loading dashboards from ${selectedApp} app`);
        const dashboards = await splunkd.listDashboards(selectedApp, splunkdInfo);
        cli.action.stop(`found ${dashboards.length} dashboards`);

        const { selectedDashboards, dashboardTagMap } = await parseDashboardsAndTags(dashboards);
        console.log('Selected Dashboards:', selectedDashboards);
        console.log('Dashboard Tag Map:', dashboardTagMap);
    }

    console.log(`\nCreating project in ./${folderName}`);
    const srcFolder = path.join(__dirname, '..');
    const destFolder = path.join(process.cwd(), folderName);
    await fs.mkdir(destFolder);

    await fs.copy(path.join(srcFolder, 'template'), destFolder, { recursive: true });
    //const copyToDest = (p, opts) => fs.copy(path.join(srcFolder, p), path.join(destFolder, p), opts);
    //await copyToDest('yarn.lock');

    await updatePackageJson(
        { folderName, version: '1.0.0', projectName, splunkdUrl, splunkdUser, selectedApp, selectedDashboards },
        { destFolder }
    );
    await writeDotenv({ splunkdUrl, splunkdUser, splunkdPassword, splunkdToken }, { destFolder });

    await exec('yarn', ['install'], { cwd: destFolder });
    await generateDashboards(selectedDashboards, selectedApp, splunkdInfo, destFolder);

    await exec('git', ['init'], { cwd: destFolder });
    await exec('git', ['add', '.'], { cwd: destFolder });
    await exec('git', ['commit', '-m', 'initialized dashpub project'], { cwd: destFolder });
    if (!process.env.DASHPUB_VERCEL) {
        if (await prompts.confirm(`Setup Vercel project?`)) {
            await initVercelProject({ folderName, destFolder, splunkdUrl, splunkdUser, splunkdPassword });
        } else {
            console.log(postInitInstructions({ folderName }));
        }
    } else if (process.env.DASHPUB_VERCEL.toLowerCase() == 'y') {
        await initVercelProject({ folderName, destFolder, splunkdUrl, splunkdUser, splunkdPassword });
    } else {
        console.log(postInitInstructions({ folderName }));
    }
}

module.exports = {
    initNewProject,
    generateDashboards,
};
