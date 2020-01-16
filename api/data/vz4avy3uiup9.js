import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query:
            'index="xdainew" sourcetype=transaction:event name=TransferWithData address=0x4b78a47532d9e966574d30189b3de734a232a78a \n| timechart count ',
        refresh: 14
    },
    'splunk-dashboard-app',
    'vz4avy3uiup9'
);
