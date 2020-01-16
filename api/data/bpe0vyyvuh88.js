import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '| stats count \n| eval count=90',
        refresh: 400
    },
    'splunk-dashboard-app',
    'bpe0vyyvuh88'
);
