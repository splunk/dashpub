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

const crypto = require('crypto');

const makeId = ds => {
    const h = crypto.createHash('sha256');
    if (ds.query) {
        h.write(ds.query);
    }
    if (ds.queryParameters) {
        if (ds.queryParameters.earliest) {
            h.write(ds.queryParameters.earliest);
        }
        if (ds.queryParameters.latest) {
            h.write(ds.queryParameters.latest);
        }
    }
    if (ds.refresh) {
        h.write(ds.refresh);
    }
    if (ds.postprocess) {
        h.write(ds.postprocess);
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

async function generateCdnDataSource([key, ds], allDataSources) {
    let settings = ds.options;

    if (ds.type === 'ds.chain') {
        const base = allDataSources[ds.options.extend];
        if (!base) {
            throw new Error(`Unable to find base search ${ds.options.extend} for data source ${key}`);
        }
        settings = {
            ...base.options,
            postprocess: ds.options.query,
        };
    }

    if (!settings.query) {
        return null;
    }

    const id = makeId(settings);

    const dataSourceManifest = [
        id,
        {
            search: { ...settings, refresh: parseRefreshTime(ds.options.refresh) },
            app: 'search',
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
    const results = []; //await Promise.all(Object.entries(def.dataSources || {}).map(e => generateCdnDataSource(e, def.dataSources)));
    for (const e of Object.entries(def.dataSources || {})) {
        const res = await generateCdnDataSource(e, def.dataSources);
        if (res != null) {
            results.push(res);
        }
    }

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
