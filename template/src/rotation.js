import React, { useEffect, Suspense, useState } from 'react';
import Loading from './loading';

export function Rotation({ dashboards, time = 60000 }) {
    const [cur, setCur] = useState(dashboards[0]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % dashboards.length;
            setCur(dashboards[i]);
        }, time);
        return () => {
            clearInterval(interval);
        };
    }, [setCur, dashboards, time]);

    const dashboard = cur;
    return <Suspense fallback={<Loading />}>{dashboard}</Suspense>;
}
