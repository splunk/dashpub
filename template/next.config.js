const fs = require('fs');
const path = require('path');
const settings = Object.assign({}, require('./package.json').dashpub.settings);

module.exports = {
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
};
