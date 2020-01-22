import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '|  stats count \n|  eval count=991',
        refresh: 400
    },
    'splunk-dashboard-app',
    'ub7m12ioec9n'
);
