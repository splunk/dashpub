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
