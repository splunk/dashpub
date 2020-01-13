const { loadDashboard } = require('./splunkd');
const { downloadImage } = require('./assets');
const { generateCdnDataSources } = require('./datafns');
const { writeFile, mkdirp, remove } = require('fs-extra');
const path = require('path');
require('dotenv').config();

async function main() {
    const app = 'splunk-dashboard-app';
    const dash = await loadDashboard('bcb_token_analytics_k1838q8v', app);

    // cleanup
    await remove(path.join(__dirname, '../public/assets'));
    await remove(path.join(__dirname, '../api/data'));

    // create required dirs
    await mkdirp(path.join(__dirname, '../public/assets'));
    await mkdirp(path.join(__dirname, '../api/data'));

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

    await writeFile(path.join(__dirname, '../src/definition.json'), Buffer.from(JSON.stringify(newDash, null, 2), 'utf-8'));
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
