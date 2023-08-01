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

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const Inner = styled.div`
    font-size: 24px;
`;

const Msg = styled.span`
    color: #333;
`;

export default function Loading() {
    return (
        <Wrapper>
            <Inner>
                <div style={{ width: '600px', margin: 'auto' }}>
                    {' '}
                    <video
                        autoPlay
                        muted
                        loop
                        width="600px"
                        style={{ margin: 'auto', align: 'center' }}
                        src={require('../../public/video_inspector_running.mov')}
                    />
                </div>
            </Inner>
        </Wrapper>
    );
}
