import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query: 'index="ponycashauth" (source=wallet-api-access status!=200) \n| stats count',
        refresh: 400
    },
    'splunk-dashboard-app',
    'ewt7wzyc4n7h'
);
