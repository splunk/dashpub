import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '|  stats count \n|  eval count=23',
        refresh: 400
    },
    'splunk-dashboard-app',
    '7ed2ru73fs41'
);
