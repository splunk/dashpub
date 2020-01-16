import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query: 'index="pony*" \n| stats dc(clientid) as users',
        refresh: 27
    },
    'splunk-dashboard-app',
    'xocmbqw0wjgy'
);
