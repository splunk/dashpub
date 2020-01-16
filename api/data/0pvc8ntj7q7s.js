import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        refresh: 323,
        query:
            'index="xdainew" sourcetype=transaction to=0x4B78a47532D9e966574D30189B3dE734A232A78a (method.name=transferWithData OR method.name=transfer) status=success\n| dedup hash  \n| eval value=`fromBcbWei(\'method.args._value\')` \n|stats sum(value) AS total dc(hash) as num_transactions sum(gas) AS gas\n| eval transaction_fee=total*0.015+num_transactions*0.029, gas_cost=gas/1000000000\n| fields transaction_fee'
    },
    'splunk-dashboard-app',
    '0pvc8ntj7q7s'
);
