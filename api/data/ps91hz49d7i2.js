import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query: '| stats count\n| eval count=4.2',
        refresh: 400
    },
    'splunk-dashboard-app',
    'ps91hz49d7i2'
);
