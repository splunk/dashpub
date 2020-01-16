import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query:
            'index="ponycashauth" (source="source=app:telemetry" OR source="wallet-api-access") durationMS=* \n| timechart span=2m partial=f avg(durationMS) as latency \n| fields latency _time \n| search latency>0',
        refresh: 54
    },
    'splunk-dashboard-app',
    '04l1qobjcf5b'
);
