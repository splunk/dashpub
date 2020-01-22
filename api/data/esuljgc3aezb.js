import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query: 'index=ethereum \n| timechart span=1m count \n| search count>0',
        refresh: 3
    },
    'splunk-dashboard-app',
    'esuljgc3aezb'
);
