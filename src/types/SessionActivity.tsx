import type { ISessionCollectionActivity, IScore, ISessionBreak } from "./types";

class SessionCollectionActivity implements ISessionCollectionActivity {
    scores: IScore[];
    start: Date | null;
    end: Date | null
    done: boolean;
    breaks: ISessionBreak[];
    duration: number;

    constructor() {
        this.scores = [];
        this.breaks = [];
    }
}

export default SessionCollectionActivity;