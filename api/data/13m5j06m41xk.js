import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query:
            '| tstats avg(CloudFront_Access_Log.time_taken) as time_taken FROM datamodel=CloudFront_Access_Log where (CloudFront_Access_Log.cs_host="*") AND ((*)) by CloudFront_Access_Log.cs_host CloudFront_Access_Log.edge_location_name CloudFront_Access_Log.cs_uri_stem _time \n| timechart partial=f span=3m avg(time_taken) as duration \n| eval duration=round(duration,0) \n| fillnull value=1 \n| fields duration _time',
        refresh: 43
    },
    'splunk-dashboard-app',
    '13m5j06m41xk'
);
