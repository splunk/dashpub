import React, { useEffect, useState } from 'react';

class ReadyHandle {
    _ready = false;
    constructor(type) {
        this.type = type;
    }
    ready() {
        if (!this._ready) {
            this._ready = true;
            this.notify(this.type);
        }
    }
    isReady() {
        return this._ready;
    }
    remove() {
        this.onDelete();
        this.notify = null;
    }
}

let isReady = false;
const readinessDeps = new Set();
const readynessCallbacks = new Set();

function trigger() {
    if (isReady) {
        return;
    }
    if ([...readinessDeps].every((d) => d.isReady())) {
        isReady = true;
        setTimeout(() => {
            for (const cb of readynessCallbacks) {
                cb();
            }
        }, 250);
    }
}

function sub(cb) {
    if (isReady) {
        cb();
        return () => {};
    } else {
        readynessCallbacks.add(cb);
        const fallbackTimer = setTimeout(trigger, 100);
        return () => {
            clearTimeout(fallbackTimer);
            readynessCallbacks.delete(cb);
        };
    }
}

export function registerScreenshotReadinessDep(type) {
    const handle = new ReadyHandle(type);
    readinessDeps.add(handle);
    handle.notify = trigger;
    handle.onDelete = () => {
        readinessDeps.delete(handle);
    };
    return handle;
}

export function useReadyForScreenshot() {
    const [ready, setReady] = useState(isReady);
    useEffect(
        () =>
            sub(() => {
                setReady(isReady);
            }),
        [setReady]
    );
    return ready;
}

export function SayCheese() {
    const ready = useReadyForScreenshot();
    return ready ? <div className="url2png-cheese"></div> : null;
}
