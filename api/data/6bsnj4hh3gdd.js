import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '0',
            latest: ''
        },
        query:
            'index=givecrypto_summary (from_role=* OR to_role=*) \n| dedup hash \n| eval value=round(value/1000000000000000000/1.2706480304955527,2) \n| eval from=substr(lower(from),0,8)."..." \n| eval to=substr(lower(to),0,8)."..." \n| search to_store=* AND to_store!="Cash Out"\n| stats count',
        refresh: 400
    },
    'splunk-dashboard-app',
    '6bsnj4hh3gdd'
);
