import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query:
            'index="ponycashauth" (source=wallet-api-access status!=200) \n| stats count \n| appendcols \n    [ search index="ponycashauth" (source="source=app:telemetry" OR source="wallet-api-access") durationMS=* \n    | stats avg(durationMS) as latency \n    | fields latency] \n| eval health=if(count=0 AND latency<500,100,if(count<3 AND latency<500,95,if(count<5 AND latency<1000,90,80))) \n| fields health',
        refresh: 400
    },
    'splunk-dashboard-app',
    'c3vko8tceymo'
);
