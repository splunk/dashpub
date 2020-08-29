const fs = require('fs-extra');
const path = require('path');

async function writeDotenv({ splunkdUrl, splunkdUser, splunkdPassword }, { destFolder = process.cwd() } = {}) {
    console.log('Writing splunkd password to .env');
    await fs.writeFile(
        path.join(destFolder, '.env'),
        [
            `SPLUNKD_URL=${splunkdUrl}`,
            `SPLUNKD_USER=${splunkdUser}`,
            `SPLUNKD_PASSWORD=${splunkdPassword}`,
            'BROWSER=none',
            '',
        ].join('\n'),
        {
            encoding: 'utf-8',
        }
    );
}

module.exports = {
    writeDotenv,
};
