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
const qs = require('querystring');
const fetch = require('node-fetch');
const debug = require('debug')('datasnapshot');
const { cli } = require('cli-ux');
require('dotenv').config();

const qualifiedSearchString = query => (query.trim().startsWith('|') ? query : `search ${query}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchData(search, { id, app, refresh, splunkdUrl, splunkUser, splunkPassword }) {
    const log = require('debug')(`ds:${id}`);

    const agent = splunkdUrl.startsWith('https')
        ? new (require('https').Agent)({
              rejectUnauthorized: false,
          })
        : undefined;

    log('Executing search for data fn', id);
    const SERVICE_PREFIX = `servicesNS/${encodeURIComponent(splunkUser)}/${encodeURIComponent(app)}`;
    const r = await fetch(`${splunkdUrl}/${SERVICE_PREFIX}/search/jobs`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from([splunkUser, splunkPassword].join(':')).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: qs.stringify({
            output_mode: 'json',
            earliest_time: (search.queryParameters || {}).earliest,
            latest_time: (search.queryParameters || {}).latest,
            search: qualifiedSearchString(search.query),
            // reuse_max_seconds_ago: refresh,
            timeout: 120,
        }),
        agent,
    });

    if (r.status > 299) {
        throw new Error(`Failed to dispatch job, splunkd returned HTTP status ${r.status}`);
    }
    const { sid } = await r.json();
    log(`Received search job sid=${sid} - waiting for job to complete`);

    let complete = false;
    while (!complete) {
        const statusData = await fetch(`${splunkdUrl}/${SERVICE_PREFIX}/search/jobs/${encodeURIComponent(sid)}?output_mode=json`, {
            headers: {
                Authorization: `Basic ${Buffer.from([splunkUser, splunkPassword].join(':')).toString('base64')}`,
            },
            agent,
        }).then(r => r.json());

        const jobStatus = statusData.entry[0].content;
        if (jobStatus.isFailed) {
            throw new Error('Search job failed');
        }
        complete = jobStatus.isDone;
        if (!complete) {
            await sleep(250);
        }
    }

    log('Search job sid=%s for data fn id=%s is complete', sid, id);

    const resultsQs = qs.stringify({
        output_mode: 'json_cols',
        count: 10000,
        offset: 0,
        search: search.postprocess,
    });
    const data = await fetch(`${splunkdUrl}/${SERVICE_PREFIX}/search/jobs/${sid}/results?${resultsQs}`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${Buffer.from([splunkUser, splunkPassword].join(':')).toString('base64')}`,
        },
        agent,
    }).then(r => r.json());

    return data;
}

function* findUsedDataSources(dashboardManifest, readJSON) {
    const seen = new Set();

    for (const dashboard of Object.keys(dashboardManifest)) {
        const def = readJSON(`src/dashboards/${dashboard}/definition.json`);

        for (const viz of Object.values(def.visualizations)) {
            if (viz.dataSources) {
                for (const dsid of Object.values(viz.dataSources)) {
                    const id = def.dataSources[dsid].options.uri.split('/').slice(-1)[0];
                    if (!seen.has(id)) {
                        seen.add(id);
                        yield id;
                    }
                }
            }
        }
    }
}

async function takeDataSnapshot(projectRoot, project, splunkdInfo) {
    cli.action.start('Analyzing datasources from all dashboards');
    const projectFile = filePath => path.join(projectRoot, filePath);
    const readJSON = filePath => JSON.parse(fs.readFileSync(projectFile(filePath), { encoding: 'utf-8' }));
    const dataSources = readJSON('src/pages/api/data/_datasources.json');
    const baseOptions = {
        splunkdUrl: splunkdInfo.url,
        splunkUser: splunkdInfo.username,
        splunkPassword: splunkdInfo.password,
    };

    if (!baseOptions.splunkPassword) {
        throw new Error('SPLUNKD_PASSWORD environment variable not set');
    }

    const allData = {};

    const usedDatasources = [...findUsedDataSources(readJSON('src/_dashboards.json'), readJSON)];
    cli.action.stop(`found ${usedDatasources.length} unique data sources`);
    const progress = cli.progress({
        format: 'Fetching search results | {bar} | {value}/{total} searches',
    });
    let complete = 0;
    progress.start(usedDatasources.length, 0);

    for (let i = 0; i < usedDatasources.length; i += 10) {
        const chunk = usedDatasources.slice(i, i + 10);
        debug('Processing chunk idx=%d len=%d', i, chunk.length);
        const results = await Promise.all(
            chunk.map(id =>
                (async () => {
                    const { search, app } = dataSources[id];
                    debug('Fetching DS', id);
                    const data = await fetchData(search, { id, app, ...baseOptions, refresh: 400 });
                    progress.update(++complete);
                    return { id, data };
                })()
            )
        );
        for (const { id, data } of results) {
            allData[id] = data;
        }
    }
    progress.stop();

    cli.action.start('Writing snapshot file');
    fs.writeFileSync(projectFile('src/pages/api/data/_snapshot.json'), JSON.stringify(allData, null, 2), { encoding: 'utf-8' });
    cli.action.stop();
}

async function clearSnapshot(projectRoot) {
    fs.writeFileSync(path.join(projectRoot, 'src/pages/api/data/_snapshot.json'), '{}', { encoding: 'utf-8' });
}

module.exports = {
    clearSnapshot,
    takeDataSnapshot,
};
