import React from 'react';
import Homepage from '../components/home';
import Page from '../components/page';
import 'bootstrap/dist/css/bootstrap.css';

export default function Home({}) {
    return (
        <Page title={ process.env.NEXT_PUBLIC_DASHPUBTITLE || "Dashboards"} theme="light">
            <Homepage />
        </Page>
    );
}
