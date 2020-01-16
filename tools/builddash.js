const { loadDashboard } = require('./splunkd');
const { downloadImage } = require('./assets');
const { generateCdnDataSources } = require('./datafns');
const { writeFile, mkdirp, remove } = require('fs-extra');
const path = require('path');
require('dotenv').config();

const COMPONENT_CODE = `\
import React from 'react';
import Dashboard from '../../dashboard';
import definition from './definition.json';

export default function() {
    return <Dashboard definition={definition} />;
}
`;

async function generateDashboard({ name, targetName = name, app }) {
    const dash = await loadDashboard(name, app);
    const newDash = await generateCdnDataSources(dash);
    for (const viz of Object.values(newDash.visualizations)) {
        try {
            if (viz.type === 'viz.singlevalueicon') {
                viz.options.icon = await downloadImage(viz.options.icon, 'icons', app);
            }
            if (viz.type === 'viz.img') {
                viz.options.src = await downloadImage(viz.options.src, 'images', app);
            }
        } catch (e) {
            console.error('Failed to download image', e);
        }
    }

    if (newDash.layout.options.backgroundImage) {
        newDash.layout.options.backgroundImage.src = await downloadImage(newDash.layout.options.backgroundImage.src, 'images', app);
    }

    const dir = path.join(__dirname, '../src/dashboards', targetName);

    await mkdirp(dir);
    await writeFile(path.join(dir, 'definition.json'), Buffer.from(JSON.stringify(newDash, null, 2), 'utf-8'));
    await writeFile(path.join(dir, 'index.js'), COMPONENT_CODE, 'utf-8');
}

async function main() {
    const app = 'splunk-dashboard-app';

    // cleanup
    await remove(path.join(__dirname, '../public/assets'));
    await remove(path.join(__dirname, '../api/data'));
    await remove(path.join(__dirname, '../src/dashboards'));

    // create required dirs
    await mkdirp(path.join(__dirname, '../public/assets'));
    await mkdirp(path.join(__dirname, '../api/data'));

    const dashboards = ['bcb_token_analytics_k1838q8v', 'bcb_architecture_k0mw0wvq'];

    for (const dashboard of dashboards) {
        await generateDashboard({
            name: dashboard,
            targetName: dashboard
                .split('_')
                .slice(0, -1)
                .join('_'),
            app
        });
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
