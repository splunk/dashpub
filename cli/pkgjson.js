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

const fs = require('fs-extra');
const path = require('path');

async function getPackageJson(folder = process.cwd()) {
    return JSON.parse(await fs.readFile(path.join(folder, 'package.json'), { encoding: 'utf-8' }));
}

async function updatePackageJson(
    { folderName, version, projectName, splunkdUrl, splunkdUser, selectedApp, selectedDashboards, settings },
    { destFolder = process.cwd() } = {}
) {
    const pkg = await getPackageJson(destFolder);
    if (folderName != null) {
        pkg.name = folderName;
    }
    if (version != null) {
        pkg.version = version;
    }
    const prev = pkg.dashpub || { splunkd: {} };
    pkg.dashpub = {
        projectName: projectName || prev.projectName,
        settings: Object.assign(
            {
                useDataSnapshots: false,
            },
            prev.settings,
            settings
        ),
        splunkd: {
            url: splunkdUrl || prev.splunkd.url,
            user: splunkdUser || prev.splunkd.user,
        },
        app: selectedApp,
        dashboards: selectedDashboards || prev.dashboards,
    };

    const customDeps = process.env.DASHPUB_CUSTOM_DEPS ? JSON.parse(process.env.DASHPUB_CUSTOM_DEPS) : [];

    customDeps.forEach(dep => {
            for (const [packageName, version] of Object.entries(dep)) {
                pkg.dependencies[packageName] = version;
            }
    });
    await fs.writeFile(path.join(destFolder, 'package.json'), JSON.stringify(pkg, null, 4));
}

module.exports = {
    updatePackageJson,
    getPackageJson,
};
