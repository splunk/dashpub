import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '2019-10-21T23:44:50.000',
            latest: '2019-10-24T15:28:00.211'
        },
        refresh: 215,
        query: 'index=xdainew to="0x4B78a47532D9e966574D30189B3dE734A232A78a" \n| timechart span=30m count'
    },
    'splunk-dashboard-app'
);
