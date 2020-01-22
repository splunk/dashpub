import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-30d@d',
            latest: 'now'
        },
        query:
            'index=givecrypto_summary (from_role=* OR to_role=*) \n| dedup hash \n| eval value=round(value/1000000000000000000/1.2706480304955527,2) \n| eval from=substr(lower(from),0,8)."..." \n| eval to=substr(lower(to),0,8)."..." \n| fillnull from_role to_role value="Unknown" \n| fillnull value=" " \n| table _time from from_role from_store from_field_op_city from_gender to to_role to_store to_field_op_city to_gender value \n| rename from_field_op_city AS from_city to_field_op_city AS to_city\n| sort - _time',
        refresh: 400
    },
    'splunk-dashboard-app',
    '079qq4ajgxyr'
);
