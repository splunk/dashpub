import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '|  stats count \n|  eval count=41',
        refresh: 400
    },
    'splunk-dashboard-app',
    'etpla2yfklur'
);
