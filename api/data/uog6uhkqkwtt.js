import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        refresh: 138,
        query:
            'index="xdainew" sourcetype="transaction" to=0x4B78a47532D9e966574D30189B3dE734A232A78a \n| dedup hash \n| eval method=\'method.name\' \n| eval data=`hex2ascii(\'method.args._data\')` \n| eval value=`fromBcbWei(\'method.args._value\')` \n| fillnull from_fname to_fname toc_fname value="Unknown" \n| eval from=substr(lower(from),0,8) \n| eval to=lower(to) \n| eval to=if(to="0x4B78a47532D9e966574D30189B3dE734A232A78a",\'to_fname\',substr(to,0,8)) \n| eval abi_to=substr(lower(\'method.args._to\'),0,8) \n| table _time from from_addy_type to abi_to to_addy_type value data method \n| eval transferType=if(from_addy_type="User Wallet" AND to_addy_type="Donation","Donation",if(from_addy_type="User Wallet" AND to_addy_type="Pinball","Pinball",if(from_addy_type="User Wallet" AND to_addy_type="User Wallet","P2P",if(from_addy_type="TestChip" AND to_addy_type="User Wallet","Sweep",if(from_addy_type="AirdropAcct" AND to_addy_type="TestChip","Test_Airdrop",if(from_addy_type="AirdropAcct" AND to_addy_type="BCBChip","BCB_Airdrop","Unknown")))))) \n| search transferType="P2P" | stats sum(value) as total_bcb | eval total_bcb=round(total_bcb,2)'
    },
    'splunk-dashboard-app',
    'uog6uhkqkwtt'
);
