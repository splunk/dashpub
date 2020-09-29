/*
Copyright 2020 Splunk Inc. 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { lazy } from 'react';
import CdnDataSource from './datasource';
import DrilldownHandler from './drilldown';
import { applyTheme } from './theme';
import { polyfillTextDecoder } from './polyfills';

const fixRequestParams = (LazyComponent) => (props) => {
    if (props.dataSources.primary && !props.dataSources.primary.requestParams) {
        props.dataSources.primary.requestParams = { count: 100 };
    }

    return <LazyComponent {...props} />;
};

// mirrors preset flags that are added in default VisualizationPreset
// https://cd.splunkdev.com/devplat/dashboard-framework/-/blob/0a4d0726f6eb0d95b1be6b9535eeb479db34dbe7/packages/dashboard-presets/src/VisualizationPresets.js#L56
const fixPresetFlags = (LazyComponent) => {
    // LazyComponent.showLastUpdated = true;
    LazyComponent.showProgressBar = true;
    LazyComponent.showTitleAndDescription = true;
    LazyComponent.showLastUpdated = true;
    return LazyComponent;
};

const lazyViz = (fn) => {
    return lazy(() =>
        fn().then((res) => {
            if (res.themes) {
                applyTheme(res.themes);
            }
            return res;
        })
    );
};

const PRESET = {
    layouts: {
        absolute: lazyViz(() => import('@splunk/dashboard-layouts/AbsoluteLayoutViewer')),
    },
    dataSources: {
        'ds.cdn': CdnDataSource,
    },
    eventHandlers: {
        'drilldown.customUrl': DrilldownHandler,
    },
    visualizations: {
        'abslayout.line': lazyViz(() => import('@splunk/dashboard-layouts/visualizations/ConnectedLine'), true),
        'viz.area': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Area'))),
        'viz.bar': fixPresetFlags(fixRequestParams(lazyViz(() => import('@splunk/dashboard-visualizations/Bar')))),
        'viz.bubble': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Bubble'))),
        'viz.choropleth.svg': fixPresetFlags(
            lazyViz(() => polyfillTextDecoder().then(() => import('@splunk/dashboard-visualizations/ChoroplethSvg')))
        ),
        'viz.column': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Column'))),
        'viz.ellipse': lazyViz(() => import('@splunk/dashboard-visualizations/Ellipse')),
        'viz.fillergauge': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/FillerGauge'))),
        'viz.geojson.us': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Choropleth'))),
        'viz.geojson.world': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Choropleth'))),
        'viz.img': lazyViz(() => import('@splunk/dashboard-visualizations/Image'), true),
        'viz.line': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Line'))),
        'viz.markdown': lazyViz(() => import('@splunk/dashboard-visualizations/Markdown'), true),
        'viz.markergauge': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/MarkerGauge'))),
        'viz.pie': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Pie'))),
        'viz.punchcard': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Punchcard'))),
        'viz.radialgauge': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/RadialGauge'))),
        'viz.rectangle': lazyViz(() => import('@splunk/dashboard-visualizations/Rectangle')),
        'viz.scatter': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Scatter'))),
        'viz.singlevalue': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/SingleValue'))),
        'viz.singlevalueicon': lazyViz(() => import('@splunk/dashboard-visualizations/SingleValueIcon')),
        'viz.singlevalueradial': fixPresetFlags(lazyViz(() => import('@splunk/dashboard-visualizations/SingleValueRadial'))),
        'viz.table': fixPresetFlags(fixRequestParams(lazyViz(() => import('@splunk/dashboard-visualizations/Table')))),
        'viz.text': lazyViz(() => import('@splunk/dashboard-visualizations/Text')),
    },
};

export default PRESET;
