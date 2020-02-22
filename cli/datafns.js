const crypto = require('crypto');

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
    h: 3600000,
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

async function generateCdnDataSource([key, ds], projectDir) {
    const id = makeId(ds.options);
    // const code = createDataFnCode(, id);
    // const filename = `${id}.js`;
    // await writeFile(path.join(projectDir, 'api/data', filename), code);
    // await new Promise((resolve, reject) => {
    //     const p = spawn('yarn', ['prettier', '--write', path.join('api/data', filename)]);
    //     p.on('close', code => {
    //         if (code === 0) {
    //             resolve();
    //         } else {
    //             reject(new Error(`prettier process exited with code ${code}`));
    //         }
    //     });
    // });

    const dataSourceManifest = [
        id,
        {
            search: { ...ds.options, refresh: parseRefreshTime(ds.options.refresh) },
            app: 'splunk-dashboard-app',
            id,
        },
    ];

    const dataSourceDefinition = [
        key,
        {
            type: 'ds.cdn',
            name: ds.name,
            options: {
                uri: `/api/data/${id}`,
            },
        },
    ];

    return [dataSourceManifest, dataSourceDefinition];
}

async function generateCdnDataSources(def, projectDir) {
    const results = await Promise.all(Object.entries(def.dataSources || {}).map(e => generateCdnDataSource(e, projectDir)));

    const dsManifest = Object.fromEntries(results.map(r => r[0]));
    const dataSourceDefinition = Object.fromEntries(results.map(r => r[1]));

    return [
        dsManifest,
        {
            ...def,
            dataSources: dataSourceDefinition,
        },
    ];
}

module.exports = {
    generateCdnDataSources,
};
