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
