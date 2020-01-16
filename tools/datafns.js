const { writeFile } = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const createDataFnCode = (queryOptions, id) => `\
    import { makeDataFn } from '../../lib/datafn';

    export default makeDataFn(
        ${JSON.stringify(queryOptions, null, 2)},
        'splunk-dashboard-app',
        ${JSON.stringify(id)}
    );
`;

const makeId = ds => {
    const h = crypto.createHash('sha256');
    h.write(ds.query);
    if (ds.queryOptions) {
        if (ds.queryOptions.earliest) {
            h.write(ds.queryOptions.earliest);
        }
        if (ds.queryOptions.latest) {
            h.write(ds.queryOptions.latest);
        }
        if (ds.queryOptions.refresh) {
            h.write(ds.queryOptions.refresh);
        }
    }
    h.end();
    const s = h.digest('hex').slice(0, 24);
    let res = '';
    for (let i = 0; i < s.length; i += 2) {
        res += (parseInt(s.slice(i, i + 2), 16) % 36).toString(36)[0];
    }
    return res;
};

const units = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000
};

function parseRefreshTime(refresh, defaultValue = 400) {
    if (typeof refresh === 'number') {
        return refresh;
    }
    if (typeof refresh === 'string') {
        const m = refresh.match(/^(\d+)(ms|s|m|h)$/);
        if (m) {
            const v = parseInt(m[1]);
            if (!isNaN(v)) {
                const u = units[m[2]];
                if (u) {
                    const ms = v * u;

                    if (ms < 1000) {
                        console.log('WARN: Ignoring sub-second refresh time');
                        return defaultValue;
                    }
                    return Math.floor(ms / 1000);
                }
            }
        }
        const n = parseInt(refresh, 10);
        if (!isNaN(n)) {
            return n;
        }
    }
    return defaultValue;
}

async function generateCdnDataSource([key, ds]) {
    const id = makeId(ds.options);
    const code = createDataFnCode({ ...ds.options, refresh: parseRefreshTime(ds.options.refresh) }, id);
    const filename = `${id}.js`;
    await writeFile(path.join(__dirname, '../api/data', filename), code);
    await new Promise((resolve, reject) => {
        const p = spawn('yarn', ['prettier', '--write', path.join('api/data', filename)]);
        p.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`prettier process exited with code ${code}`));
            }
        });
    });
    return [
        key,
        {
            type: 'ds.cdn',
            name: ds.name,
            options: {
                query: `| cdn ${id}`,
                uri: `/api/data/${id}`
            }
        }
    ];
}

async function generateCdnDataSources(def) {
    const dataSourceEntries = await Promise.all(Object.entries(def.dataSources).map(generateCdnDataSource));

    return {
        ...def,
        dataSources: Object.fromEntries(dataSourceEntries)
    };
}

module.exports = {
    generateCdnDataSources
};
