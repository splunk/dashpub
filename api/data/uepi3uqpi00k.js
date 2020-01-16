import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query: 'index="pony*" \n| timechart count',
        refresh: 7
    },
    'splunk-dashboard-app',
    'uepi3uqpi00k'
);
