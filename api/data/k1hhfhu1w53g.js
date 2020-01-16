import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query: 'index="xdainew" sourcetype=transaction* \n| timechart partial=f span=5m count \n| fields count _time',
        refresh: 17
    },
    'splunk-dashboard-app',
    'k1hhfhu1w53g'
);
