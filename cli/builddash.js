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

const { loadDashboard } = require('./splunkd');
const { downloadImage } = require('./assets');
const { generateCdnDataSources } = require('./datafns');
const { writeFile, mkdirp, remove } = require('fs-extra');
const { cli } = require('cli-ux');
const path = require('path');

const COMPONENT_CODE = `\
import React, { lazy, Suspense } from 'react';
import Loading from '../../components/loading';
import NoSSR from '../../components/nossr';
import definition from './definition.json';

const Dashboard = lazy(() => import('../../components/dashboard'));

export default function () {
    return (
        <NoSSR>
            <Suspense fallback={<Loading />}>
                <Dashboard definition={definition} />
            </Suspense>
        </NoSSR>
    );
}
`;

async function generateDashboard({ name, targetName = name, app, projectFolder, dashboardTags=[] }, splunkdInfo) {
    const dash = await loadDashboard(name, app, splunkdInfo);
    const [dsManifest, newDash] = await generateCdnDataSources(dash, app, projectFolder);
    for (const viz of Object.values(newDash.visualizations || {})) {
        try {
            if (viz.type === 'viz.singlevalueicon') {
                viz.options.icon = await downloadImage(viz.options.icon, 'icons', splunkdInfo, projectFolder);
            }
            if (viz.type === 'splunk.singlevalueicon') {
                viz.options.icon = await downloadImage(viz.options.icon, 'icons', splunkdInfo, projectFolder);
            }
            if (viz.type === 'viz.img') {
                if (viz.options.src.match(/\$.*\$/g) )
                    console.log(`Skipping image download due to token ${viz.options.src}`)
                else{
                    viz.options.src = await downloadImage(viz.options.src, 'images', splunkdInfo, projectFolder);
                }
            }
            if (viz.type === 'splunk.image') {
               if (viz.options.src.match(/\$.*\$/g) )
                    console.log(`Skipping image download due to token ${viz.options.src}`)
               else if (viz.options.src.startsWith("data:image")) {
                   console.log("Skipping because image is embedded as string")
               } else {
                    viz.options.src = await downloadImage(viz.options.src, 'images', splunkdInfo, projectFolder);
               }
            }
           if (viz.type === 'splunk.choropleth.svg') {
               if (viz.options.svg.match(/\$.*\$/g) )
                   console.log(`Skipping image download due to token ${viz.options.svg}`)
               else if (viz.options.svg.startsWith("data:image")) {
                   console.log("Skipping because image is embedded as string")
               }
               else {
                   viz.options.svg = await downloadImage(viz.options.svg, 'images', splunkdInfo, projectFolder);
               }
           }
        } catch (e) {
            console.error(`Failed to download image ${viz.options.icon || viz.options.src}`, e);
        }
    }

    if (newDash.layout.options.backgroundImage) {
        newDash.layout.options.backgroundImage.src = await downloadImage(
            newDash.layout.options.backgroundImage.src,
            'images',
            splunkdInfo,
            projectFolder
        );
    }

    const dir = path.join(projectFolder, 'src/dashboards', targetName);
    await mkdirp(dir);
    await writeFile(path.join(dir, 'definition.json'), Buffer.from(JSON.stringify(newDash, null, 2), 'utf-8'));
    await writeFile(path.join(dir, 'index.js'), COMPONENT_CODE, 'utf-8');

    return [dsManifest, { [name]: {"title": newDash.title, "tags":dashboardTags} }];
}

async function generate(app, dashboards, splunkdInfo, projectFolder) {
    console.log(`Generating ${dashboards.length} dashboards...`);
    // cleanup
    await remove(path.join(projectFolder, 'public/assets'));
    await remove(path.join(projectFolder, 'src/pages/api/data/_datasources.json'));
    await remove(path.join(projectFolder, 'src/dashboards'));

    // create required dirs
    await mkdirp(path.join(projectFolder, 'public/assets'));
    await mkdirp(path.join(projectFolder, 'src/pages/api/data'));

    let datasourcesManifest = {};
    let dashboardsManifest = {};

    // If older-style array then convert to object
    dashboards = Array.isArray(dashboards) ? dashboards.reduce((a, v) => ({ ...a, [v]: {}}), {}) : dashboards

    console.log(dashboards);
    for (const dashboard in dashboards) {
        console.log(dashboard);
        const targetName = dashboard;
        cli.action.start(`Generating dashboard ${dashboard}`);
        let dashboardTags=[];
        if (Object.keys(dashboards[dashboard]).includes("tags")) {
            console.log("Found tags: " + dashboards[dashboard]['tags'].join(", "));
            dashboardTags = dashboards[dashboard]['tags'];
        }

        const [dsManifest, dashboardInfo] = await generateDashboard(
            {
                name: dashboard,
                targetName,
                app,
                projectFolder,
                dashboardTags
            },
            splunkdInfo
        );

        datasourcesManifest = Object.assign(datasourcesManifest, dsManifest);
        Object.assign(dashboardsManifest, dashboardInfo);
        cli.action.stop();
    }

    cli.action.start('Writing manifest files...');
    await writeFile(path.join(projectFolder, 'src/pages/api/data/_datasources.json'), JSON.stringify(datasourcesManifest, null, 4), {
        encoding: 'utf-8',
    });
    await writeFile(path.join(projectFolder, 'src/_dashboards.json'), JSON.stringify(dashboardsManifest, null, 4), {
        encoding: 'utf-8',
    });
    cli.action.stop();
}

module.exports = {
    generate,
};
