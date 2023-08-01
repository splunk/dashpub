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

const fs = require('fs');
const path = require('path');
const settings = Object.assign({}, require('./package.json').dashpub.settings);
const withVideos = require('next-videos');

module.exports = withVideos({
    webpack(config, { buildId, webpack }) {
        const snapshotPath = path.join(__dirname, 'src/pages/api/data/_snapshot.json');
        if (!fs.existsSync(snapshotPath)) {
            fs.writeFileSync(snapshotPath, '{}', { encoding: 'utf-8' });
        }
        if (settings.useDataSnapshots) {
            const contents = fs.readFileSync(snapshotPath, { encoding: 'utf-8' });
            if (contents === '{}') {
                throw new Error('Data snapshots are enabled, but snapshot is empty');
            }
        }

        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.USE_DATA_SNAPSHOTS': JSON.stringify(settings.useDataSnapshots),
                'process.env.DASHPUB_BUILD_ID': JSON.stringify(buildId),
            })
        );

        return config;
    },
});
