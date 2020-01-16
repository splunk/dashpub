import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        refresh: 513,
        query:
            '| mstats count prestats=true WHERE metric_name="memory.free" AND index="em_metrics" AND host="ip-172-31-11-176" span=5m BY host \n| timechart partial=f count span=5m agg=max limit=5 useother=false BY host \n| fields - _span \n| sort - _time \n| head 1 \n| rename "ip-172-31-11-176" AS xdai_node1 \n| appendcols \n    [| makeresults \n    | eval isdown="DOWN"] \n| eval up_down=if(xdai_node1>0,"UP",isdown)\n| fields up_down '
    },
    'splunk-dashboard-app',
    '1nps8hfl01y8'
);
