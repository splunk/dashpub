const { loadDashboard, splunkd } = require('./splunkd');
const { writeFile, mkdirp } = require('fs-extra');
const path = require('path');
require('dotenv').config();

function parseDataUri(dataUri) {
    if (!dataUri.startsWith('data:')) {
        throw new Error('Invalid data URI');
    }
    const semiIdx = dataUri.indexOf(';');
    if (semiIdx < 0) {
        throw new Error('Invalid data URI');
    }
    const mime = dataUri.slice(5, semiIdx);
    if (!dataUri.slice(semiIdx + 1, 7) === 'base64,') {
        throw new Error('Unsupported data URI encoding');
    }
    const data = Buffer.from(dataUri.slice(semiIdx + 8), 'base64');
    return [mime, data];
}

const seenImages = {};

async function downloadImage(src, assetType, app) {
    if (src in seenImages) {
        return seenImages[src];
    }
    const [type, id] = src.split('://');

    if (type === 'splunk-enterprise-kvstore') {
        console.log('Downloading image', id);
        const imgData = await splunkd(
            'GET',
            `/servicesNS/nobody/${encodeURIComponent(app)}/storage/collections/data/splunk-dashboard-${assetType}/${encodeURIComponent(id)}`
        );

        const [mimeType, data] = parseDataUri(imgData.dataURI);

        let filename;

        switch (mimeType) {
            case 'image/svg+xml':
                filename = `${id}.svg`;
                break;
            case 'image/jpeg':
            case 'image/jpg':
                filename = `${id}.jpg`;
                break;
            case 'image/png':
                filename = `${id}.png`;
                break;
            default:
                throw new Error(`Unsupported mime type: ${mimeType}`);
        }

        await writeFile(path.join(__dirname, '../public/assets', filename), data);
        const newUri = `/assets/${filename}`;
        seenImages[src] = newUri;
        return newUri;
    }

    throw new Error(`Unexpected image type: ${type}`);
}

async function main() {
    const app = 'splunk-dashboard-app';
    const dash = await loadDashboard('bcb_architecture_k0mw0wvq', app);
    await mkdirp(path.join(__dirname, '../public/assets'));
    for (const viz of Object.values(dash.visualizations)) {
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

    if (dash.layout.options.backgroundImage) {
        dash.layout.options.backgroundImage.src = await downloadImage(dash.layout.options.backgroundImage.src, 'images', app);
    }

    await writeFile(path.join(__dirname, '../src/definition.json'), Buffer.from(JSON.stringify(dash, null, 2), 'utf-8'));
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
