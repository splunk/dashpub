import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        query: 'index=givecrypto_summary \n| timechart span=1d dc(hash) as count',
        refresh: 400
    },
    'splunk-dashboard-app',
    'mpcpirrvakpw'
);
