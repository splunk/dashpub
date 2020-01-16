import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-15m',
            latest: 'now'
        },
        query: '| stats count\n| eval count="NORMAL"',
        refresh: 400
    },
    'splunk-dashboard-app',
    'i5apv4379vga'
);
