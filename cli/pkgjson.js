const fs = require('fs-extra');
const path = require('path');

async function getPackageJson(folder = process.cwd()) {
    return JSON.parse(await fs.readFile(path.join(folder, 'package.json'), { encoding: 'utf-8' }));
}

async function updatePackageJson(
    { folderName, version, projectName, splunkdUrl, splunkdUser, selectedDashboards, settings },
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
        dashboards: selectedDashboards || prev.dashboards,
    };

    await fs.writeFile(path.join(destFolder, 'package.json'), JSON.stringify(pkg, null, 4));
}

module.exports = {
    updatePackageJson,
    getPackageJson,
};
