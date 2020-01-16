import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-60m@m',
            latest: 'now'
        },
        query:
            '`aws-cloudwatch-rds( (aws_account_id="414345301310") , (region="*"))` (metric_dimensions="DBInstanceIdentifier=[*]") metric_name="CPUUtilization" \n| `aws-cloudwatch-dimension-rex("DBInstanceIdentifier", "Instance")` \n| stats avg(Average) as valueCPU by Instance \n| search Instance="pony-cash-prod" \n| appendcols \n    [ search `aws-cloudwatch-rds( (aws_account_id="414345301310") , (region="*"))` (metric_dimensions="DBInstanceIdentifier=[*]") metric_name="FreeableMemory" \n    | `aws-cloudwatch-dimension-rex("DBInstanceIdentifier", "Instance")` \n    | stats avg(Average) as valueFreeMEM by Instance \n    | eval valueFreeMEM=round(valueFreeMEM/1024/1024,2) \n    | search Instance="pony-cash-prod"] \n| eval health=if(valueCPU<30 AND valueFreeMEM>2000,"100",if(valueCPU<50 AND valueFreeMEM>1500,"80","50")) \n| fields health',
        refresh: 54
    },
    'splunk-dashboard-app',
    'r376do5p7z8e'
);
