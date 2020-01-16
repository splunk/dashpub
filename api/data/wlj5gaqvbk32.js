import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        query:
            'index="xdai*" sourcetype="transaction" to=0x4B78a47532D9e966574D30189B3dE734A232A78a abi_to="0xd0bcb*" \n| dedup hash \n| eval data=`hex2ascii(\'method.args._data\')` \n| eval value=`fromBcbWei(\'method.args._value\')` \n| stats sum(value) as bcb_donated',
        refresh: 92
    },
    'splunk-dashboard-app',
    'wlj5gaqvbk32'
);
