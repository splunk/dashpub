import React from 'react';
import Homepage from '../components/home';
import Page from '../components/page';
import Link from '@splunk/react-ui/Link';
import styled from 'styled-components';
import useSplunkTheme from '@splunk/themes/useSplunkTheme';
import { format } from "util";
import 'bootstrap/dist/css/bootstrap.css';

export default function Home() {
    const { focusColor } = useSplunkTheme();
    const Footer = styled.p`
        color: ${focusColor};
        text-align:center;
    `
    const imageUrl = format("/%s/%s.%s", process.env.NEXT_PUBLIC_DASHPUBSCREENSHOTDIR || "screens" , "index", process.env.NEXT_PUBLIC_DASHPUBSCREENSHOTEXT || "png");
    return (
        <Page
            title={process.env.NEXT_PUBLIC_DASHPUBTITLE || 'Dashboards'}
            theme={process.env.NEXT_PUBLIC_HOMETHEME || 'light'}
            imageUrl={imageUrl}
            baseUrl={process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null}>
            <Homepage key="home" />
            { process.env.NEXT_PUBLIC_DASHPUBFOOTER!=="false" ?
            <Footer align="center">
                {process.env.NEXT_PUBLIC_DASHPUBFOOTER || "Hosted Splunk Dashboards" }
                {process.env.NEXT_PUBLIC_DASHPUBHOSTEDBY ? <> by <Link to={process.env.NEXT_PUBLIC_DASHPUBHOSTEDURL || '#'} openInNewContext="">{process.env.NEXT_PUBLIC_DASHPUBHOSTEDBY}</Link> </> : " "}
                using <Link to={process.env.NEXT_PUBLIC_DASHPUBREPO || "https://github.com/splunk/dashpub"} openInNewContext="">Dashpub</Link>
            </Footer> : "" }
        </Page>
    );
}
