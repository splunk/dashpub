import React, { useEffect } from "react";
import styled from "styled-components";
import TimelapseControls from "./controls";
import Dashboard from "../components/dashboard";
import DEFAULT_PRESET from "../preset";
import TimelapseDataSource from "./timelapseds";
import jsCharting from "@splunk/charting-bundle";

function hackDisableProgressiveRender() {
  const c = jsCharting.createChart(document.createElement("div"), {});
  c.constructor.prototype.shouldProgressiveDraw = () => false;
  c.destroy();
}

window.jsCharting = jsCharting;

const DashboardWrapper = styled.div`
  padding-top: 125px;
`;

const TIMELAPSE_PRESET = {
  ...DEFAULT_PRESET,
  dataSources: {
    "ds.cdn": TimelapseDataSource,
  },
};

export default function TimelapseDashboard({ dashDef }) {
  useEffect(() => {
    hackDisableProgressiveRender();
  }, []);

  return (
    <>
      <TimelapseControls definition={dashDef} />
      <DashboardWrapper>
        <Dashboard
          definition={dashDef}
          preset={TIMELAPSE_PRESET}
          height="calc(100vh - 125px)"
        />
      </DashboardWrapper>
    </>
  );
}
