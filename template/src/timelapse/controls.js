import React, { useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import ColumnChart from "@splunk/react-visualizations/Column";
import Play from "@splunk/react-icons/Play";
import Pause from "@splunk/react-icons/Pause";
import Spinner from "@splunk/react-ui/WaitSpinner";
import Slider from "./slider";
import {
  globalTime,
  useTimeList,
  useCurrentTime,
  usePlaybackStatus,
  usePlaybackSpeed,
} from "./timecontext";
import { useState } from "react";

const Wrapper = styled.div`
  position: fixed;
  tops: 0;
  left: 0;
  right: 0;
  height: 125px;
  background: #ffffff;
  border-bottom: 5px solid rgb(8, 9, 10);
  color: #444444;
  z-index: 999;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LoadingCt = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const PlaybackControls = styled.div`
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const CurrentValueCt = styled.div`
  width: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
`;

const Timeline = styled.div`
  flex: 1;
  position: relative;
`;

const SliderCt = styled.div`
  box-sizing: border-box;
  padding: 0 10px 0 10px;
  background: rgba(255, 255, 255, 0.001);
  position: absolute;
  top: 0;
  width: 100%;
  height: 120px;
  z-index: 999;
`;
let i = 0;

function minutes_with_leading_zeros(dt) {
  return (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes();
}

function CurrentTimeValue() {
  const val = useCurrentTime();
  if (!val) {
    return null;
  }
  return (
    <div>
      {val.getMonth() + 1}/{val.getDate()}/{val.getYear() % 100}{" "}
      {val.getHours()}:{minutes_with_leading_zeros(val)}
    </div>
  );
}

const Btn = styled.a`
  display: block;
  color: #444444;
  text-decoration: none;
  padding: 10px;
  cursor: pointer;
`;

function PlayPauseButton() {
  const isPlaybackRunning = usePlaybackStatus();

  const startPlayback = useCallback(() => {
    globalTime.startPlayback();
  }, []);

  const stopPlayback = useCallback(() => {
    globalTime.stopPlayback();
  }, []);

  return (
    <Btn>
      {isPlaybackRunning ? (
        <Pause onClick={stopPlayback} size={2} />
      ) : (
        <Play onClick={startPlayback} size={2} />
      )}
    </Btn>
  );
}

function PlaybackSpeed() {
  const curSpeed = usePlaybackSpeed();
  const handleChange = useCallback((e) => {
    globalTime.speed = +e.target.value;
  }, []);

  return (
    <select value={curSpeed} onChange={handleChange}>
      <option value={0.5}>.5x</option>
      <option value={1}>1x</option>
      <option value={2}>2x</option>
      <option value={3}>3x</option>
      <option value={5}>5x</option>
      <option value={10}>10x</option>
    </select>
  );
}

export default function TimelapseControls({ definition }) {
  const [values, setValues] = useState([]);
  useEffect(() => {
    let active = true;
    (async () => {
      const ds = Object.values(definition.dataSources).find(
        (def) => def.name === "Time Series"
      );
      if (!ds) {
        throw new Error("MISSING TIMELINE DATASOURCE");
      }
      const res = await fetch(ds.options.uri);
      const data = await res.json();
      if (active) {
        const times = data.columns[data.fields.indexOf("_time")];
        const caseNumbers = data.columns[data.fields.indexOf("x")];

        const newValues = times
          .sort()
          .map((_, i) => i)
          .map((v) => parseFloat(caseNumbers[v]))
          .reduce(
            (res, v, i, all) => {
              return i >= all.length - 1
                ? res
                : res.concat(
                    Math.min(0.6, 0.05 + Math.max(0, Math.log2(all[i + 1] / v)))
                  );
            },
            [0.05]
          );

        globalTime.setTimes(times);
        setValues(newValues);
        globalTime.startPlayback();
      }
    })().catch((e) => {
      console.error(e);
    });

    return () => {
      active = false;
    };
  }, [definition, setValues]);

  const times = useTimeList();

  if (!times.length || !values.length) {
    return (
      <Wrapper>
        <LoadingCt>
          <Spinner size="medium" />
        </LoadingCt>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <PlaybackControls>
        <PlayPauseButton />
        {/* <PlaybackSpeed /> */}
      </PlaybackControls>
      <CurrentValueCt>
        <CurrentTimeValue />
      </CurrentValueCt>
      <Timeline>
        <ColumnChart
          backgroundColor={"transparent"}
          xFieldName={"_time"}
          yFieldName={"rate"}
          legendPlacement="none"
          xAxisMajorLabelVisibility="show"
          xAxisMajorTickSize={0}
          xAxisMajorTickVisibility="hide"
          yAxisMajorLabelVisibility="hide"
          yAxisVisibility="hide"
          yAxisScale="linear"
          yAxisMajorTickVisibility="hide"
          xAxisTitleVisibility="collapsed"
          yAxisTitleVisibility="collapsed"
          foregroundColor="#333333"
          seriesColors={["#444444"]}
          height={120}
          columnSpacing={0}
          seriesSpacing={0}
          x={times}
          y={values}
        />
        <SliderCt>
          <Slider times={times} />
        </SliderCt>
      </Timeline>
    </Wrapper>
  );
}
