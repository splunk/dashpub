import { makeDataFn } from '../../lib/datafn';

export default makeDataFn(
    {
        queryParameters: {
            earliest: '-24h@h',
            latest: 'now'
        },
        query:
            '`aws-cloudwatch-lambda( (aws_account_id="*") , (region="*"))` \n| where Average>0 \n| stats avg(Average) as avg by metric_dimensions metric_name _time \n| `aws-cloudwatch-dimension-rex("FunctionName", "FunctionName")` \n| search metric_name=Duration \n| search FunctionName="us-east-1.lmoqt2c-fcguqyq"\n| timechart partial=f span=2m avg(avg) as value \n|  fields value _time \n| search value>0',
        refresh: 334
    },
    'splunk-dashboard-app',
    'ob1l23w8epaq'
);
