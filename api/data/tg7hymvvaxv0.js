import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query: '| stats count \n| eval count=1',
        refresh: 400
    },
    'splunk-dashboard-app',
    'tg7hymvvaxv0'
);
