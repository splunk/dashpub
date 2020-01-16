const fetch = require('node-fetch');
const qs = require('querystring');
const baseDebug = require('debug')('datafn');
baseDebug.enabled = true;

const qualifiedSearchString = query => (query.trim().startsWith('|') ? query : `search ${query}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const makeDataFn = (search, app, id) => {
    const debug = baseDebug.extend(id);
    debug.enabled = true;
    const qualifiedSearch = qualifiedSearchString(search.query);
    return async (req, res) => {
        try {
            debug('Executing search for data fn', id);
            const SERVICE_PREFIX = `servicesNS/${encodeURIComponent(process.env.SPLUNKD_USER)}/${encodeURIComponent(app)}`;
            const r = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString(
                        'base64'
                    )}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: qs.stringify({
                    output_mode: 'json',
                    earliest_time: search.queryParameters.earliest,
                    latest_time: search.queryParameters.latest,
                    search: qualifiedSearch,
                    reuse_max_seconds_ago: search.refresh,
                    timeout: search.refresh * 2
                })
            });

            if (r.status > 299) {
                throw new Error(`Failed to dispatch job, splunkd returned HTTP status ${r.status}`);
            }
            const { sid } = await r.json();
            debug(`Received search job sid=${sid} - waiting for job to complete`);

            let complete = false;
            while (!complete) {
                const statusData = await fetch(
                    `${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${encodeURIComponent(sid)}?output_mode=json`,
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from(
                                [process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')
                            ).toString('base64')}`
                        }
                    }
                ).then(r => r.json());

                const jobStatus = statusData.entry[0].content;
                if (jobStatus.isFailed) {
                    throw new Error('Search job failed');
                }
                complete = jobStatus.isDone;
                if (!complete) {
                    await sleep(250);
                }
            }

            debug('Search job sid=%s for data fn id=%s is complete', sid, id);

            const resultsQs = qs.stringify({
                output_mode: 'json_cols',
                count: 10000,
                offset: 0
            });
            const data = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${sid}/results?${resultsQs}`, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString(
                        'base64'
                    )}`
                }
            }).then(r => r.json());

            debug('Retrieved count=%d results from job sid=%s for data fn id=%s', data.columns.length, sid, id);
            res.setHeader('cache-control', `s-maxage=${search.refresh}, stale-while-revalidate`);
            const { columns, fields } = data;
            res.json({ fields, columns });
        } catch (e) {
            debug('Error fetching data for data fn %s', id, e);
            res.status(500);
            res.json({ error: 'Failed to fetch data' });
        }
    };
};
