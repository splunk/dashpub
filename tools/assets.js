const { splunkd } = require('./splunkd');
const { writeFile } = require('fs-extra');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

function shortHash(buffer) {
    const h = crypto.createHash('sha256');
    h.write(buffer);
    h.end();
    return h.digest('hex').slice(0, 20);
}

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
        let optimzed = data;

        let filename;

        switch (mimeType) {
            case 'image/svg+xml':
                filename = `${id}.svg`;
                break;
            case 'image/jpeg':
            case 'image/jpg':
                filename = `${id}.jpg`;
                optimzed = await sharp(data)
                    .jpeg()
                    .toBuffer();
                break;
            case 'image/png':
                filename = `${id}.png`;
                optimzed = await sharp(data)
                    .png()
                    .toBuffer();
                break;
            default:
                throw new Error(`Unsupported mime type: ${mimeType}`);
        }

        filename = `${shortHash(optimzed)}_${filename}`;
        await writeFile(path.join(__dirname, '../public/assets', filename), optimzed);
        const newUri = `/assets/${filename}`;
        seenImages[src] = newUri;
        return newUri;
    }

    throw new Error(`Unexpected image type: ${type}`);
}

module.exports = {
    downloadImage
};
