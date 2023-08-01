import { useState, useEffect } from 'react';

class GlobalTime {
    _times = [];
    _subs = new Set();
    _cur = null;
    _timer = null;
    _loop = true;
    _speed = 10;
    span = 43200000;

    setRange(from, to) {
        const times = [];
        let start = from;
        const now = to || new Date();
        while (start < now) {
            times.push(start.getTime());
            start = new Date(start.getTime() + this.span);
        }
        this._times = times;
        this.setTime(0);
    }

    setTimes(times) {
        this._times = times.map(t => new Date(t).getTime());
        this._times.sort();
        this.setTime(0);
    }

    subscribe(callback) {
        this._subs.add(callback);
        if (this._cur != null) {
            callback(this._cur);
        }
        return () => {
            this._subs.delete(callback);
        };
    }

    subscribeToTime(callback) {
        let cur = this.currentTime;
        if (cur != null) {
            callback(cur);
        }
        return this.subscribe(() => {
            const next = this.currentTime;
            if (next?.getTime() != cur?.getTime()) {
                callback(next);
                cur = next;
            }
        });
    }

    subscribeToTime(callback) {
        let cur = this.currentTime;
        if (cur != null) {
            callback(cur);
        }
        return this.subscribe(() => {
            const next = this.currentTime;
            if (next?.getTime() != cur?.getTime()) {
                callback(next);
                cur = next;
            }
        });
    }

    subscribeToTimeSpan(callback) {
        let cur = this._cur;
        if (cur != null) {
            callback(this.timeSpanAt(cur));
        }
        return this.subscribe(() => {
            const next = this._cur;
            if (next != cur) {
                callback(this.timeSpanAt(next));
                cur = next;
            }
        });
    }

    get currentTime() {
        const dateVal = this._times[Math.max(0, Math.min(this._times.length - 1, Math.floor(this._cur)))];
        return dateVal != null ? new Date(dateVal) : null;
    }

    timeSpanAt(idx) {
        if (idx != null) {
            idx = Math.max(0, Math.min(this._times.length - 1, Math.floor(idx)));
            const start = this._times[idx];
            if (start != null) {
                const endVal = this._times[idx + 1];
                const end = endVal != null ? endVal : start + this.span;
                return [start, end];
            }
        }
        return null;
    }

    get currentTimeSpan() {
        return this._cur != null ? this.timeSpanAt(this._cur) : null;
    }

    get current() {
        return this._cur;
    }

    get timeList() {
        return this._times;
    }

    get speed() {
        return this._speed;
    }

    set speed(val) {
        this._speed = val;
        if (this.isPlaybackRunning()) {
            this.stopPlayback();
            this.startPlayback();
        }
    }

    setTime(time) {
	if (time !== this._cur) {
            this._cur = time;
            this.notify();
        }
    }

    notify() {
        const newVal = this.currentTime;
        for (const sub of this._subs.values()) {
            sub(newVal);
        }
    }

    isPlaybackRunning() {
        return this._timer != null;
    }

    startPlayback() {
        this.stopPlayback();
        this._timer = setInterval(() => {
            if (this._cur < this._times.length) {
                this.setTime(this._cur + 0.1);
            } else {
                if (this._loop) {
                    this.setTime(0);
                } else {
                    this.stopPlayback();
                }
            }
        }, Math.floor(64 * (1 / this._speed)));
    }

    stopPlayback() {
        if (this._timer != null) {
            this._timer = clearInterval(this._timer);
            this._timer = null;
            this.notify();
        }
    }
}

export const globalTime = new GlobalTime();

export function useCurrentTime() {
    const [val, setVal] = useState(globalTime.currentTime);

    useEffect(() => {
        const unsubscribe = globalTime.subscribeToTime(val => setVal(val));
        return () => {
            unsubscribe();
        };
    }, [setVal]);

    return val;
}

export function useTimeList() {
    const [val, setVal] = useState(globalTime.timeList);
    useEffect(() => {
        const unsubscribe = globalTime.subscribe(() => {
            setVal(globalTime.timeList);
        });
        return () => {
            unsubscribe();
        };
    }, [setVal]);
    return val;
}

export function usePlaybackStatus() {
    const [val, setVal] = useState(globalTime.timeList);
    useEffect(() => {
        const unsubscribe = globalTime.subscribe(() => {
            setVal(globalTime.isPlaybackRunning());
        });
        return () => {
            unsubscribe();
        };
    }, [setVal]);
    return val;
}

export function usePlaybackSpeed() {
    const [val, setVal] = useState(globalTime.speed);
    useEffect(() => {
        const unsubscribe = globalTime.subscribe(() => {
            setVal(globalTime.speed);
        });
        return () => {
            unsubscribe();
        };
    }, [setVal]);
    return val;
}
