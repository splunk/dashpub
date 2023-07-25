import React, { lazy, Suspense, useState } from "react";
import Loading from "../../components/loading";
import NoSSR from "../../components/nossr";
import Page from "../../components/page";
import { useRouter } from "next/router";
import ComponentRotator from "react-component-rotator";
import FullscreenLight from "@splunk/react-icons/FullscreenLight";

const Dashboard = lazy(() => import("../../components/dashboard"));

export default function DashboardPage({ dashboardId, baseUrl }) {
  const { query } = useRouter();

  const toggleFullSceen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      document.body.style.cursor = "none";
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!query.dashboards || !query.timer) {
    return null;
  } else {
    var dashboards = [];
    var dashboards = query.dashboards.split(",");

    var defs = {};

    var baseUrl = `https://${process.env.VERCEL_URL}`;

    for (var dashboard in dashboards) {
      defs[
        dashboards[dashboard]
      ] = require(`../../dashboards/${dashboards[dashboard]}/definition.json`);
    }

    var pages = [];
    for (var def in defs) {
      pages.push(
        <Page
          title={defs[def].title || "Dashboard"}
          description={defs[def].description}
          imageUrl={`/screens/${dashboardId}.png`}
          path={`/${dashboardId}`}
          backgroundColor={defs[def].layout.options.backgroundColor}
          theme={defs[def].theme}
          baseUrl={baseUrl}
        >
          <NoSSR>
            <Suspense fallback={<Loading />}>
              <Dashboard definition={defs[def]} />
            </Suspense>
          </NoSSR>
        </Page>
      );
    }
    return (
      <>
        <FullscreenLight
          style={{
            position: "fixed",
            zIndex: "2",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            color: "black",
          }}
          onClick={() => toggleFullSceen()}
        ></FullscreenLight>
        <div
          style={{
            "&:hover": {
              cursor: "none",
            },
          }}
        >
          <ComponentRotator
            style={{
              position: "fixed",
              zIndex: "1",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              color: "black",
            }}
            delay={query.timer}
            children={pages}
          ></ComponentRotator>
        </div>
      </>
    );
  }
}
