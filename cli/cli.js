#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { initNewProject, generateDashboards } = require('./init');

require('dotenv').config();

const usage = () => {
    console.error(`Usage: udfpub (init|update) [...options]`);
    process.exit(1);
};

async function main([cmd]) {
    if (cmd === 'init') {
        await initNewProject();
    } else if (cmd === 'update') {
        const dir = process.cwd();
        const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf-8'));
        await generateDashboards(pkg.udfpub.dashboards, {}, dir);
    } else {
        usage();
    }
}

main(process.argv.slice(2)).catch(e => {
    console.error(e);
    process.exit(1);
});
