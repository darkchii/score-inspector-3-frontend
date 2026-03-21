import type { ISessionCollectionActivity, IScore, ISessionBreak } from "./types";

class SessionCollectionActivity implements ISessionCollectionActivity {
    scores: IScore[];
    start: Date | null = null;
    end: Date | null = null;
    done: boolean = false;
    breaks: ISessionBreak[] = [];
    duration: number = 0;

    constructor() {
        this.scores = [];
        this.breaks = [];
    }
}

export default SessionCollectionActivity;