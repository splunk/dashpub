#!/usr/bin/env node

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
