import DataSource from '@splunk/datasources/DataSource';
import DataSet from '@splunk/datasource-utils/DataSet';
// import { Observable } from 'rxjs';

export default class PublicDataSource extends DataSource {
    constructor(options = {}, context = {}) {
        super(options, context);
        console.log('new DS(%o, %o)', options, context);
        if (!this.options.query && !this.options.sid) {
            throw Error('query string or sid is required!');
        }
    }

    async setup() {
        console.log('DS setup()');
        return null;
    }

    request(requestParams = {}) {
        console.log('DS.request', requestParams);

        return observer => {
            console.log('SUBSCRIBE', observer);

            observer.next({
                data: DataSet.fromJSONCols([], [])
            });

            return () => {
                console.log('UNSUBSCRIBE');
            };
        };
    }

    async teardown() {
        console.log('DS.teardown');
        return null;
    }
}
