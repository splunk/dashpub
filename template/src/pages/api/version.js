const fs = require('fs');
const path = require('path');

let VERSION = null;

try {
    const contents = fs.readFileSync(path.join(__dirname, '_version.json'));
    const obj = JSON.parse(contents);
    VERSION = obj.version;
} catch (e) {
    // ignore
}

export default async (req, res) => {
    res.setHeader('cache-control', `s-maxage=3600`);
    res.json({
        version: VERSION,
    });
};
