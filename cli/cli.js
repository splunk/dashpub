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

const { initNewProject, generateDashboards } = require('./init');
const { getPackageJson } = require('./pkgjson');
const { ensureAuth, updatePassword } = require('./auth');
const { takeDataSnapshot, clearSnapshot } = require('./snapshot');

require('dotenv').config();

const usage = () => {
    console.error(`Usage: dashpub (init|update|auth|snapshot) [...options]`);
    process.exit(1);
};

async function main([cmd]) {
    if (cmd === 'init') {
        await initNewProject();
    } else if (cmd === 'auth') {
        await loadProject();
        await updatePassword();
    } else if (cmd === 'update') {
        const project = await loadProject();
        const splunkdInfo = await ensureAuth();
        await generateDashboards(project.dashboards, splunkdInfo, process.cwd());
        if (project.settings.useDataSnapshots) {
            await takeDataSnapshot(process.cwd(), project, splunkdInfo);
        } else {
            await clearSnapshot(process.cwd());
        }
    } else if (cmd === 'snapshot') {
        const project = await loadProject();
        const splunkdInfo = await ensureAuth();
        await takeDataSnapshot(process.cwd(), project, splunkdInfo);
    } else {
        usage();
    }
}

async function loadProject() {
    const pkg = await getPackageJson();
    if (!pkg.dashpub) {
        throw new Error('This project does not seem to dashpub-generated. Missing dashpub section in package.json');
    }
    return pkg.dashpub;
}

main(process.argv.slice(2)).catch(e => {
    console.error(e);
    process.exit(1);
});
