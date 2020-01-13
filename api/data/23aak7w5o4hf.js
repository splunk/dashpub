import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        query:
            'index="xdainew" sourcetype="transaction" to=0x4B78a47532D9e966574D30189B3dE734A232A78a \n| dedup hash \n| eval data=`hex2ascii(\'method.args._data\')` \n| eval value=`fromBcbWei(\'method.args._value\')` \n| eval from=lower(from) \n| eval to=lower(\'method.args._to\') \n| stats sum(value) as "Debits" by from \n| eval Debits=Debits*-1 \n| rename from as Address \n| append \n    [ search index="xdainew" sourcetype="transaction" to=0x4B78a47532D9e966574D30189B3dE734A232A78a \n    | dedup hash \n    | eval data=`hex2ascii(\'method.args._data\')` \n    | eval value=`fromBcbWei(\'method.args._value\')` \n    | eval from=lower(from) \n    | eval to=lower(\'method.args._to\') \n    | stats sum(value) as "Credits" by to \n    | rename to as Address ] \n| fillnull value=0 \n| stats sum(Debits) as "Debits" sum(Credits) as "Credits" by Address \n| eval Debits=round(Debits,2) \n| eval Credits=round(Credits,2) \n| eval Balance=round(Debits+Credits,2) \n| sort - Balance \n| table Address Debits Credits Balance \n| search NOT Address="0x7e57*" \n| search NOT Address="0x5702E*"\n| search NOT Address="0xbcb*" \n| lookup crypto_address address AS Address OUTPUT fname \n| search NOT fname=*\n| table Address fname Debits Credits Balance\n| head 1\n| fields Balance',
        refresh: 307
    },
    'splunk-dashboard-app'
);
