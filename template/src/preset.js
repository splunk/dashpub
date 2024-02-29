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
import { polyfillTextDecoder } from './polyfills';
import { DropdownInput, TimeRangeInput, MultiselectInput, TextInput, NumberInput } from '@splunk/dashboard-inputs';
//import { Preset } from '@splunk/dashboard-context';
const fixRequestParams = (LazyComponent) => (props) => {
    if (props.dataSources.primary && !props.dataSources.primary.requestParams) {
        props.dataSources.primary.requestParams = { count: 100 };
    }

    return <LazyComponent {...props} />;
};

const commonFlags = (LazyComponent) => {
    LazyComponent.showProgressBar = true;
    LazyComponent.showTitleAndDescription = true;
    LazyComponent.showLastUpdated = true;
    // LazyComponent.backgroundColor = "#171d21";
    return LazyComponent;
};

const lazyViz = (fn) => {
    return lazy(fn);
};

const deepMerge = (obj1, obj2) => {
    const result = { ...obj1 }; // Start with a shallow copy of obj1

    Object.keys(obj2).forEach((key) => {
        if (obj1.hasOwnProperty(key) && typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            // If both objects have the same key with object values, merge these objects recursively
            result[key] = deepMerge(obj1[key], obj2[key]);
        } else {
            // Otherwise, just take the value from obj2
            result[key] = obj2[key];
        }
    });

    return result;
};

const PRESET = {
    layouts: {
        absolute: lazyViz(() => import('@splunk/dashboard-layouts/AbsoluteLayoutViewer')),
        grid: lazyViz(() => import('@splunk/dashboard-layouts/GridLayoutViewer')),
    },
    dataSources: {
        'ds.cdn': CdnDataSource,
    },
    eventHandlers: {
        'drilldown.customUrl': DrilldownHandler,
    },
    visualizations: {
        // legacy
        'abslayout.line': lazyViz(() => import('@splunk/dashboard-layouts/visualizations/ConnectedLine'), true),
        'viz.area': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Area'))),
        'viz.bar': commonFlags(fixRequestParams(lazyViz(() => import('@splunk/dashboard-visualizations/Bar')))),
        'viz.bubble': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Bubble'))),
        'viz.choropleth.svg': commonFlags(
            lazyViz(() => polyfillTextDecoder().then(() => import('@splunk/dashboard-visualizations/ChoroplethSvg')))
        ),
        'viz.column': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Column'))),
        'viz.ellipse': lazyViz(() => import('@splunk/dashboard-visualizations/Ellipse')),
        'viz.fillergauge': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/FillerGauge'))),
        'viz.geojson.us': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Choropleth'))),
        'viz.geojson.world': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Choropleth'))),
        'viz.img': lazyViz(() => import('@splunk/dashboard-visualizations/Image'), true),
        'viz.line': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Line'))),
        'viz.markdown': lazyViz(() => import('@splunk/dashboard-visualizations/Markdown'), true),
        'viz.markergauge': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/MarkerGauge'))),
        'viz.pie': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Pie'))),
        'viz.punchcard': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Punchcard'))),
        'viz.radialgauge': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/RadialGauge'))),
        'viz.rectangle': lazyViz(() => import('@splunk/dashboard-visualizations/Rectangle')),
        'viz.scatter': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/Scatter'))),
        'viz.singlevalue': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/SingleValue'))),
        'viz.singlevalueicon': lazyViz(() => import('@splunk/dashboard-visualizations/SingleValueIcon')),
        'viz.singlevalueradial': commonFlags(lazyViz(() => import('@splunk/dashboard-visualizations/SingleValueRadial'))),
        'viz.table': commonFlags(fixRequestParams(lazyViz(() => import('@splunk/dashboard-visualizations/Table')))),
        'viz.text': lazyViz(() => import('@splunk/dashboard-visualizations/Text')),

        // default splunk visualizations
        'splunk.area': commonFlags(lazyViz(() => import('@splunk/visualizations/Area'))),
        'splunk.bar': commonFlags(lazyViz(() => import('@splunk/visualizations/Bar'))),
        'splunk.bubble': commonFlags(lazyViz(() => import('@splunk/visualizations/Bubble'))),
        'splunk.choropleth.svg': commonFlags(lazyViz(() => import('@splunk/visualizations/ChoroplethSvg'))),
        'splunk.column': commonFlags(lazyViz(() => import('@splunk/visualizations/Column'))),
        'splunk.ellipse': commonFlags(lazyViz(() => import('@splunk/visualizations/Ellipse'))),
        'splunk.fillergauge': commonFlags(lazyViz(() => import('@splunk/visualizations/FillerGauge'))),
        'splunk.image': commonFlags(lazyViz(() => import('@splunk/visualizations/Image'))),
        'splunk.line': commonFlags(lazyViz(() => import('@splunk/visualizations/Line'))),
        'splunk.linkgraph': commonFlags(lazyViz(() => import('@splunk/visualizations/LinkGraph'))),
        'splunk.markdown': commonFlags(lazyViz(() => import('@splunk/visualizations/Markdown'))),
        'splunk.markergauge': commonFlags(lazyViz(() => import('@splunk/visualizations/MarkerGauge'))),
        'splunk.parallelcoordinates': commonFlags(lazyViz(() => import('@splunk/visualizations/ParallelCoordinates'))),
        'splunk.pie': commonFlags(lazyViz(() => import('@splunk/visualizations/Pie'))),
        'splunk.punchcard': commonFlags(lazyViz(() => import('@splunk/visualizations/Punchcard'))),
        'splunk.rectangle': commonFlags(lazyViz(() => import('@splunk/visualizations/Rectangle'))),
        'splunk.sankey': commonFlags(lazyViz(() => import('@splunk/visualizations/Sankey'))),
        'splunk.scatter': commonFlags(lazyViz(() => import('@splunk/visualizations/Scatter'))),
        'splunk.singlevalue': commonFlags(lazyViz(() => import('@splunk/visualizations/SingleValue'))),
        'splunk.singlevalueicon': commonFlags(lazyViz(() => import('@splunk/visualizations/SingleValueIcon'))),
        'splunk.singlevalueradial': commonFlags(lazyViz(() => import('@splunk/visualizations/SingleValueRadial'))),
        'splunk.map': commonFlags(lazyViz(() => import('@splunk/visualizations/Map'))),
        'splunk.table': commonFlags(lazyViz(() => import('@splunk/visualizations/Table'))),
    },
    inputs: {
        'input.dropdown': DropdownInput,
        'input.timerange': TimeRangeInput,
        'input.text': TextInput,
        'input.number': NumberInput,
        'input.multiselect': MultiselectInput,
    },
};

const CUSTOM_VIZ = {};

const CUSTOM_PRESET = {
    visualizations: CUSTOM_VIZ,
};

const MERGED_PRESET = deepMerge(PRESET, CUSTOM_PRESET);

export default MERGED_PRESET;
