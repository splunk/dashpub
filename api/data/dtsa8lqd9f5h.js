import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-5m@m',
            latest: 'now'
        },
        query:
            'index=xdainew sourcetype=block \n| stats latest(number) as xdaiBlockNum \n| appendcols \n    [| geth blockNumber host=https://pony-cash.infura.io\n    | rename blockNumber AS InfuraBlockNum \n    | fields InfuraBlockNum] \n| eval dif=InfuraBlockNum-xdaiBlockNum \n| fields dif',
        refresh: 12
    },
    'splunk-dashboard-app',
    'dtsa8lqd9f5h'
);
