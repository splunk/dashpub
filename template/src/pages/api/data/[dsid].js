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

const qs = require('querystring');
const DATASOURCES = require('./_datasources.json');
const debug = require('debug')('datafn');
debug.enabled = true;

const USE_SNAPSHOT = process.env.USE_DATA_SNAPSHOTS;
let SNAPSHOTS = USE_SNAPSHOT ? require('./_snapshot.json') : null;

const qualifiedSearchString = (query) => (query.trim().startsWith('|') ? query : `search ${query}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIN_REFRESH_TIME = 60;
const agent = process.env.SPLUNKD_URL.startsWith('https')
    ? new (require('https').Agent)({
          rejectUnauthorized: false,
      })
    : undefined;

const dataResp = async (req, res) => {
    const id = req.query.dsid;
    debug('Looking up datasource ID %o', id);

    if (id == null || !(id in DATASOURCES)) {
        debug('ERROR: No datasource with ID %o found', id);
        res.setHeader('cache-control', `s-maxage=3600`);
        res.json({ error: 'Datasource not found' });
        return;
    }

    const log = require('debug')(`debug:${id}`);
    log.enabled = true;

    const { search, app } = DATASOURCES[id];
    let query = search.query;
    const refresh = Math.max(MIN_REFRESH_TIME, search.refresh || 60);
    const resultMeta = {};

    try {
        if (USE_SNAPSHOT) {
            log('Looking for snapshot of datasource %s', id);
            const data = SNAPSHOTS[id];

            if (data) {
                res.setHeader('cache-control', `s-maxage=${refresh}, stale-while-revalidate`);
                const { columns, fields } = data;
                res.json({ fields, columns, ...resultMeta });
            } else {
                log('Error: no snapshot for datasource %s found', id);
                res.status(500);
                res.json({ error: 'Failed to fetch data' });
            }
            return;
        }

        log('Executing search for data fn', id);
        const SERVICE_PREFIX = `servicesNS/${encodeURIComponent(process.env.SPLUNKD_USER)}/${encodeURIComponent(app)}`;
        const AUTH_HEADER = process.env.SPLUNKD_TOKEN
            ? `Bearer ${process.env.SPLUNKD_TOKEN}`
            : `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString('base64')}`;

        const r = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs`, {
            method: 'POST',
            headers: {
                Authorization: AUTH_HEADER,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: qs.stringify({
                output_mode: 'json',
                earliest_time: (search.queryParameters || {}).earliest,
                latest_time: (search.queryParameters || {}).latest,
                search: qualifiedSearchString(query),
                reuse_max_seconds_ago: refresh,
                timeout: refresh * 2,
            }),
            agent: agent,
        });

        if (r.status > 299) {
            throw new Error(`Failed to dispatch job, splunkd returned HTTP status ${r.status}`);
        }
        const { sid } = await r.json();
        log(`Received search job sid=${sid} - waiting for job to complete`);

        let complete = false;
        while (!complete) {
            const statusData = await fetch(
                `${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${encodeURIComponent(sid)}?output_mode=json`,
                {
                    headers: {
                        Authorization: AUTH_HEADER,
                    },
                    agent,
                }
            ).then((r) => r.json());

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
            count: 50000,
            offset: 0,
            search: search.postprocess,
        });
        const data = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${sid}/results?${resultsQs}`, {
            method: 'GET',
            headers: {
                Authorization: AUTH_HEADER,
            },
            agent,
        }).then((r) => r.json());

        log('Retrieved count=%d results from job sid=%s for data fn id=%s', data.columns.length, sid, id);
        res.setHeader('cache-control', `s-maxage=${refresh}, stale-while-revalidate`);
        const { columns, fields } = data;
        res.json({ fields, columns, ...resultMeta });
    } catch (e) {
        log('Error fetching data for data fn %s', id, e);
        res.status(500);
        res.json({ error: 'Failed to fetch data' });
    }
};
export default dataResp;
