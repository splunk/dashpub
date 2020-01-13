const fetch = require('node-fetch');
const qs = require('querystring');

const qualifiedSearchString = query => (query.trim().startsWith('|') ? query : `search ${query}`);

export const makeDataFn = (search, app) => async (req, res) => {
    const SERVICE_PREFIX = `servicesNS/${encodeURIComponent(process.env.SPLUNKD_USER)}/${encodeURIComponent(app)}`;
    const r = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify({
            output_mode: 'json',
            earliest_time: search.queryParameters.earliest,
            latest_time: search.queryParameters.latest,
            search: qualifiedSearchString(search.query),
            reuse_max_seconds_ago: search.refresh,
            timeout: search.refresh * 2
        })
    });

    if (r.status > 299) {
        throw new Error(`Failed to dispatch job, splunkd returned HTTP status ${r.status}`);
    }
    const { sid } = await r.json();
    console.log({ sid });

    let complete = false;
    do {
        await new Promise(r => setTimeout(r, 250));
        const statusData = await fetch(
            `${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${encodeURIComponent(sid)}?output_mode=json`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString(
                        'base64'
                    )}`
                }
            }
        ).then(r => r.json());

        const jobStatus = statusData.entry[0].content;
        console.log({
            isDone: jobStatus.isDone
        });
        if (jobStatus.isFailed) {
            throw new Error('Search job failed');
        }
        complete = jobStatus.isDone;
    } while (!complete);

    const resultsQs = qs.stringify({
        output_mode: 'json_cols',
        count: 10000,
        offset: 0
    });
    const data = await fetch(`${process.env.SPLUNKD_URL}/${SERVICE_PREFIX}/search/jobs/${sid}/results?${resultsQs}`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${Buffer.from([process.env.SPLUNKD_USER, process.env.SPLUNKD_PASSWORD].join(':')).toString('base64')}`
        }
    }).then(r => r.json());

    res.setHeader('cache-control', `s-maxage=${search.refresh}, stale-while-revalidate`);
    const { columns, fields } = data;
    res.json({ fields, columns });
};
