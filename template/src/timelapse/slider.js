import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { globalTime } from './timecontext';
import EventListener from 'react-event-listener';

const Wrapper = styled.div`
    width: 100%;
    height: 120px;
    background: rgba(200, 0, 0, 0.001);
    cursor: pointer;
    position: relative;
`;

const Thumb = styled.div`
    height: 120px;
    background: rgba(255, 255, 255, 0.001);
    cursor: move;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ThumbMarker = styled.div`
    height: 100px;
    width: 1px;
    border: 1px solid #d5e3d7;
    background: #d5e3d7;
    border-radius: 5px;

    ${Thumb}:hover & {
        border: 2px solid #d5e3d7;
    }
    [data-selected='true'] & {
        border: 2px solid #d5e3d7;
    }
`;

export default function Slider({ times }) {
    const [dragging, setDragging] = useState(false);
    const [val, setVal] = useState(0);
    const [selected, setSelected] = useState(false);
    const trackEl = useRef();

    useEffect(
        () =>
            globalTime.subscribe(() => {
                setVal(globalTime._cur);
            }),
        [setVal]
    );

    const handleClick = useCallback(
        e => {
            const boundingRect = trackEl.current.getBoundingClientRect();
            const offset = e.clientX - boundingRect.left;
            const value = Math.floor((offset / boundingRect.width) * times.length);
            setVal(value + 0.5);
            globalTime.stopPlayback();
            globalTime.setTime(value + 0.5);
        },
        [setSelected, setVal, trackEl]
    );

    const handleDragStart = useCallback(
        e => {
            if (e.button > 0) {
                return;
            }
            e.preventDefault();
            setDragging(true);
        },
        [setDragging]
    );

    const handleDragEnd = useCallback(e => {
        setDragging(false);
    }, []);

    const handleDrag = useCallback(
        e => {
            const boundingRect = trackEl.current.getBoundingClientRect();
            const offset = e.clientX - boundingRect.left;
            const value = Math.min(Math.floor((offset / boundingRect.width) * times.length), times.length - 1);
            setVal(value + 0.5);
            globalTime.stopPlayback();
            globalTime.setTime(value + 0.5);
        },
        [dragging]
    );

    return (
        <Wrapper onClick={handleClick} ref={trackEl}>
            {dragging && <EventListener target="window" onMouseMove={handleDrag} onMouseUp={handleDragEnd} />}
            <Thumb
                onMouseDown={handleDragStart}
                data-selected={selected || dragging}
                style={{
                    left: `calc(${(Math.max(0, val - 0.5) * 100) / times.length}% + 1px)`,
                    width: `calc(${100 / times.length}% - 2px)`,
                }}
            >
                <ThumbMarker />
            </Thumb>
        </Wrapper>
    );
}
