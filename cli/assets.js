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

const { splunkd } = require('./splunkd');
const { constants } = require('./constants');
const { writeFile } = require('fs-extra');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fetch = require('node-fetch');
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

async function nameAndStoreImage(data, mimeType, { name = 'img', projectDir }) {
    let optimzed = data;
    let filename;

    switch (mimeType) {
        case 'image/svg+xml':
            filename = `${name}.svg`;
            break;
        case 'image/jpeg':
        case 'image/jpg':
            filename = `${name}.jpg`;
            optimzed = await sharp(data)
                .jpeg()
                .toBuffer();
            break;
        case 'image/png':
            filename = `${name}.png`;
            optimzed = await sharp(data)
                .png()
                .toBuffer();
            break;
        case 'image/webp':
            filename = `${name}.webp`;
            optimzed = await sharp(data)
                .webp({effort: 6})
                .toBuffer();
            break;
        case 'image/gif':
            filename = `${name}.gif`;
            break;
        default:
            throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    filename = `${shortHash(optimzed)}_${filename}`;
    await writeFile(path.join(projectDir, 'public/assets', filename), optimzed);
    return filename;
}

async function storeImage(data, filename, {name = 'img', projectDir}) {
    await writeFile(path.join(projectDir, 'public/assets', filename), data);
    return filename;
}

async function downloadImage(src, assetType, splunkdInfo, projectDir) {
    if (!src) {
        return src;
    }
    if (src in seenImages) {
        return seenImages[src];
    }
    const [type, id] = src.split('://');

    if (type === 'https' || type === 'http') {
        const res = await fetch(src);

        const data = await res.buffer();
        const mimeType = res.headers.get('Content-Type');

        const filename = await storeImage(data, mimeType, { projectDir });
        const newUri = `/assets/${filename}`;
        seenImages[src] = newUri;
        return newUri;
    }

    if (type === 'splunk-enterprise-kvstore') {
        const imgData = await splunkd(
            'GET',
            `/servicesNS/nobody/splunk-dashboard-studio/storage/collections/data/splunk-dashboard-${assetType}/${encodeURIComponent(
                id
            )}`,
            splunkdInfo
        );

        const [mimeType, data] = parseDataUri(imgData.dataURI);
        const filename = await nameAndStoreImage(data, mimeType, { name: id, projectDir });
        // If the DASHPUB_FQDN env is set and its an SVG then return the link with FQDN prepended
        if (process.env.DASHPUB_FQDN && mimeType=="image/svg+xml") {
            var newUri = `${process.env.DASHPUB_FQDN}/assets/${filename}`;
        } else if (mimeType=="image/svg+xml") {
        // Else return the SVG XML content and embed into dash definition
            var newUri = data.toString();
        } else {
            var newUri = `/assets/${filename}`;
        }
        seenImages[src] = newUri;
        return newUri;
    }
    if (type.includes('splunkd/__raw')) {
        const imgData = await splunkd(
            'GET',
            type.split("splunkd/__raw")[1],
            splunkdInfo,
            returnJson=false
        );
        const orig_filename = type.split("/").pop()
        const filename = await storeImage(await imgData.buffer(), orig_filename, { name: id, projectDir });
        // If the DASHPUB_FQDN env is set and its an SVG then return the link with FQDN prepended
        if (process.env.DASHPUB_FQDN) {
            var newUri = `${process.env.DASHPUB_FQDN}/assets/${filename}`;
        } else {
            var newUri = `/assets/${filename}`;
        }
        seenImages[src] = newUri;
        return newUri;
    }

    throw new Error(`Unexpected image type: ${type}`);
}

module.exports = {
    downloadImage,
};