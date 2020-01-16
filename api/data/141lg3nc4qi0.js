import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query:
            'index=xdainew sourcetype=block \n| eventstats max(number) as maxBlock \n| eval miner=if(miner="0x657eA4A9572DfdBFd95899eAdA0f6197211527BE","Burner Wallet",if(miner="0x9e41BA620FebA8198369c26351063B26eC5b7C9E","MakerDAO",if(miner="0xA13D45301207711B7C0328c6b2b64862abFe9b7a","Protofire",if(miner="0x9233042B8E9E03D5DC6454BBBe5aee83818fF103","POA Network",if(miner="0xb76756f95A9fB6ff9ad3E6cb41b734c1bd805103","Portis",if(miner="0x6dC0c0be4c8B2dFE750156dc7d59FaABFb5B923D","Giveth",if(miner="0x657E832b1a67CDEF9e117aFd2F419387259Fa93e","Syncnode S.R.L",if(miner="0xa1c3Eb21cD44F0433c6be936AD84D20b70B564D3","MetaCartel",if(miner="0x10AaE121b3c62F3DAfec9cC46C27b4c1dfe4A835","Lab10 Collective",if(miner="0xA84713b6241260B3CaA2c4be00fF62b89C4315c2","Ztake.org","Unknown"))))))))))  \n| stats dc(transactions{}) AS Txns sparkline(dc(transactions{})) AS "Txn History" count AS Events latest(number) AS "Last Block" by miner maxBlock \n| eval "Blocks Behind"=maxBlock-\'Last Block\' \n| rename miner AS Miner maxBlock AS "Max Block"\n| table Miner Txns "Txn History" "Blocks Behind" "Last Block" \n| rename "Last Block" AS "L_Block" "Blocks Behind" AS Behind Miner AS Validator',
        refresh: 62
    },
    'splunk-dashboard-app',
    '141lg3nc4qi0'
);
