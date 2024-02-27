import React, { lazy, Suspense } from 'react';
import Loading from '../components/loading';
import NoSSR from '../components/nossr';
import Page from '../components/page';

//import {CloudViewOnlyPreset} from "@splunk/dashboard-presets";
//import dynamic from "next/dynamic";

//export const CloudViewOnlyPreset = dynamic(
//  () => import("@splunk/dashboard-presets").then((lib) => lib.CloudViewOnlyPreset),
//  { ssr: false, }
//);

const Dashboard = lazy(() => import('../components/dashboard'));

//import CdnDataSource from '../datasource';

//const presets = {...CloudViewOnlyPreset, ...{dataSources:{"ds.cdn":"CdnDataSource"}}}

export default function DashboardPage({ definition, dashboardId, baseUrl }) {
    return (
        <Page
            title={definition.title || 'Dashboard'}
            description={definition.description}
            imageUrl={`/screenshot/${dashboardId}.jpg`}
            path={`/${dashboardId}`}
            //  backgroundColor={"#171d21"}
            theme={definition.theme || 'light'}
            baseUrl={baseUrl}
        >
            <NoSSR>
                <Suspense fallback={<Loading />}>
                    <Dashboard definition={definition} />
                </Suspense>
            </NoSSR>
        </Page>
    );
}

export async function getStaticProps({ params }) {
    const definition = require(`../dashboards/${params.dashboard}/definition.json`);
    return {
        props: {
            definition,
            dashboardId: params.dashboard,
            baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        },
    };
}

export async function getStaticPaths() {
    const dashboards = require('../_dashboards.json');
    return {
        paths: Object.keys(dashboards)
            .filter((d) => d !== 'timelapse')
            .map((d) => ({ params: { dashboard: d } })),
        fallback: false,
    };
}
