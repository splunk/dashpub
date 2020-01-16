import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        refresh: 129,
        query:
            'index="xdainew" sourcetype=transaction to=0x4b78a47532d9e966574d30189b3de734a232a78a (method.args._to=0x5702e20a0506c59cdDCCcCB6122709a56928c63E OR  method.args._to=0x5702e43AB997814e3AD7c4f3c2Bc8287141F5efd OR \nmethod.args._to=0x5702e92a8F3e1B34dEfB84C4FB2D84EaBFbdde86 OR \nmethod.args._to=0x5702eA60fDE794bD01D90B67B7B366eA541D3855\n OR method.args._to=0x5702E889261Aa37683B4087f4ccAd3d1f7eF3970) method.name=transferWithData status=success \n| dedup hash \n| eval method=\'method.name\' \n| eval data=`hex2ascii(\'method.args._data\')` \n| eval value=`fromBcbWei(\'method.args._value\')` \n| fillnull from_fname to_fname toc_fname value="Unknown" \n| table _time hash from abi_to value data \n| rex field=data "Buy (?<encItems>[a-z]+):" \n| eval key = split(encItems, "") \n| mvexpand key \n| lookup bcb_store_items.csv key \n| stats sum(price) as total'
    },
    'splunk-dashboard-app',
    'f9bqf5u2gqh3'
);
