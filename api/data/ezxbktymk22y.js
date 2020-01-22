import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        query: 'index=givecrypto_summary from_role=RECIPIENT AND to_role=RECIPIENT\n| dedup hash \n| stats count',
        refresh: 400
    },
    'splunk-dashboard-app',
    'ezxbktymk22y'
);
