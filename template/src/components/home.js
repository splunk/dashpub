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

import React from 'react';
import styled from 'styled-components';
import { variables } from '@splunk/themes';
import dashboardManifest from '../_dashboards.json';

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const DashLink = styled.a`
    display: flex;
    color: ${variables.textColor};
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 280px;
    height: 80px;
    border: 1px solid #eee;
    margin: 10px 10px 0 0;
    box-sizing: border-box;
    padding: 0 15px;
    line-height: 120%;

    &:hover {
        background: rgb(0, 0, 0, 0.2);
    }
`;

const Title = styled.h1`
    color: ${variables.textColor};
`;

export default function Home({ title = 'Dashboards' }) {
    return (
        <Wrapper>
            <Title>Dashboards</Title>
            {Object.keys(dashboardManifest).map((k) => (
                <DashLink key={k} href={`/${k}`}>
                    {dashboardManifest[k]}
                </DashLink>
            ))}
        </Wrapper>
    );
}
