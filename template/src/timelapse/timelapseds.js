import DataSource from "@splunk/datasources/DataSource";
import DataSet from "@splunk/datasource-utils/DataSet";
import { globalTime } from "./timecontext";
import { createDataSet } from "../datasource";
import { registerScreenshotReadinessDep } from "../ready";

function capAt(fields, columns, timeColIdx, untilRow) {
  return DataSet.fromJSONCols(
    fields,
    columns.map((c) => c.slice(0, untilRow))
  );
}

function nullAfter(fields, columns, timeColIdx, untilRow) {
  return DataSet.fromJSONCols(
    fields,
    columns.map((c, i) => {
      if (i === timeColIdx) {
        return c;
      }
      return c.map((v, r) => (r >= untilRow ? null : v));
    })
  );
}

export default class TimelapseDataSource extends DataSource {
  constructor(options = {}, context = {}) {
    super(options, context);
    this.uri = options.uri;
  }

  request(options) {
    options = options || {};
    return (observer) => {
      const onabortCallbacks = [];
      let readyDep = registerScreenshotReadinessDep("TLDS");

      fetch(this.uri)
        .then((r) => r.json())
        .then(({ fields, columns, timelapse }) => {
          if (!timelapse) {
            readyDep.ready();
            observer.next({
              data: createDataSet({ fields, columns }, options),
              meta: {},
            });
          } else {
            const timeFieldIdx = fields.indexOf(timelapse.field || "_time");
            const parsedTimes = columns[timeFieldIdx].map((v) =>
              new Date(v).getTime()
            );

            switch (timelapse.transform) {
              case "null_after":
              case "cap":
                console.log("Found a cap");

                {
                  const updateUntilTime = ([time]) => {
                    const t = time;
                    let untilRow = parsedTimes.findIndex((v) => v > t);
                    if (untilRow < 0) {
                      untilRow = Infinity;
                    }
                    const fn =
                      timelapse.transform === "cap" ? capAt : nullAfter;
                    observer.next({
                      data: fn(fields, columns, timeFieldIdx, untilRow),
                      meta: { status: "done" },
                    });
                    readyDep.ready();
                  };
                  onabortCallbacks.push(
                    globalTime.subscribeToTimeSpan(updateUntilTime)
                  );
                }
                break;
              case "select":
                console.log("Found a select");
                {
                  const selectNext = ([start, end]) => {
                    observer.next({
                      data: DataSet.fromJSONCols(
                        fields.filter((_, i) => i !== timeFieldIdx),
                        columns
                          .filter((_, i) => i !== timeFieldIdx)
                          .map((c) =>
                            c.filter((_, i) => {
                              const t = parsedTimes[i];
                              return t >= start && t < end;
                            })
                          )
                      ),
                      meta: { status: "done" },
                    });
                    readyDep.ready();
                  };
                  onabortCallbacks.push(
                    globalTime.subscribeToTimeSpan(selectNext)
                  );
                }
                break;
              default:
                throw new Error(
                  `Invalid timelapse transform ${timelapse.transform}`
                );
            }
          }
        })
        .catch((e) => {
          console.error(e);
          observer.error({
            level: "error",
            message: e.message || "Unexpected error",
          });
        });

      return () => {
        for (const cb of onabortCallbacks) {
          try {
            cb();
          } catch (e) {
            console.error("Abort callback failed", e);
          }
        }
        readyDep.remove();
      };
    };
  }
}
