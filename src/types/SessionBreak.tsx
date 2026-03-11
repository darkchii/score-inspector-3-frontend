import type { ISessionBreak } from "./types";

class SessionBreak implements ISessionBreak {
    start: Date;
    end: Date;
    duration: number;

    constructor(start: Date, end: Date, duration: number = null) {
        this.start = start;
        this.end = end;
        this.duration = duration !== null ? duration : (end.getTime() - start.getTime()) / 1000;
    }
}

export default SessionBreak;