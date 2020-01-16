import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-3d',
            latest: 'now'
        },
        refresh: 219,
        query:
            'index="xdainew" sourcetype=transaction status=success method.name=transferWithData \n| lookup badges_prefixes prefix AS from OUTPUT name AS from_task_name color AS from_task_color value AS from_task_value shownInList AS from_task_in_list \n| eval known_recipient = coalesce(abi_to_fname, "(unknown)") \n| table _time from abi_to known_recipient from_task_* \n| eval to_short=substr(abi_to, 3, 7) \n| sort -_time \n| table _time from_task_color \n| search from_task_color="gold"\n| eval annotation_label = "Gold Token Sweep!" \n| eval annotation_color = "sweep" \n| table _time annotation_label annotation_color'
    },
    'splunk-dashboard-app',
    'oz7xkehbu313'
);
