import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query:
            '| mstats count prestats=true WHERE metric_name="memory.free" AND index="em_metrics" AND host="ubuntu" span=5m BY host \n| timechart partial=f count span=5m agg=max limit=5 useother=false BY host \n| fields - _span \n| sort - _time \n| head 1 \n| appendcols \n    [| makeresults \n    | eval isdown="DOWN"] \n| eval up_down=if(ubuntu>0,"UP",isdown) \n| fields up_down',
        refresh: 303
    },
    'splunk-dashboard-app',
    'z3v2vanmi7n5'
);
