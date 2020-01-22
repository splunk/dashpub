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
                <Msg>Loading...</Msg>
            </Inner>
        </Wrapper>
    );
}
