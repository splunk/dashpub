import React, { lazy, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";

import Loading from "../components/loading";
import NoSSR from "../components/nossr";
import Page from "../components/page";

const TimelapseDashboard = lazy(() => import("../timelapse"));

export default function DashboardPage() {
  const { query } = useRouter();

  const [dashboardDef, setDashboardDef] = useState({});

  useEffect(() => {
    if (typeof query.dashboard != "undefined") {
      var definition = require(`../dashboards/${query.dashboard}/definition.json`);
      setDashboardDef(definition);
    }
  }, [query]);
  return (
    <Page
      title="Timelapse"
      description={dashboardDef.description}
      imageUrl="/screens/timelapse.png"
      path="/timelapse"
      backgroundColor="#08090A"
    >
      <NoSSR>
        <Suspense fallback={<Loading />}>
          <TimelapseDashboard dashDef={dashboardDef} />
        </Suspense>
      </NoSSR>
    </Page>
  );
}
