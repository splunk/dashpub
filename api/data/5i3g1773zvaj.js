import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '| stats count\n| eval count="100"',
        refresh: 400
    },
    'splunk-dashboard-app',
    '5i3g1773zvaj'
);
