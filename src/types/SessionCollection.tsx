import Session from "./Session";
import SessionCollectionActivity from "./SessionActivity";
import SessionBreak from "./SessionBreak";
import { IScore, ISession, ISessionCollection } from "./types";

const SESSION_ACTIVITY_THRESHOLD = 60 * 60 * 1.5; //this value dictates a new activity region
const SESSION_BREAK_THRESHOLD = 60 * 5; //this value dictates a break region

class SessionCollection implements ISessionCollection {
    sessions: ISession[];
    session_map: { [id: string]: ISession };
    length: number;
    play_time: number;
    duration_longest: number;
    duration_average: number;

    constructor(sessions: ISession[]) {
        this.sessions = sessions;
        this.session_map = {};
        sessions.forEach(session => {
            this.session_map[session.id] = session;
        });
        this.length = sessions.length;

        this.play_time = 0;
        if (this.length > 0) {
            let pt = 0;
            this.duration_longest = 0;
            this.sessions.forEach(session => {
                pt += session.duration;
                if (session.duration > this.duration_longest) {
                    this.duration_longest = session.duration;
                }
            });
            this.play_time = pt;
            this.duration_average = this.play_time / this.length;
        } else {
            this.duration_longest = 0;
            this.duration_average = 0;
        }
    }

    get() {
        return this.sessions;
    }

    getById(id: string): ISession | undefined {
        return this.session_map[id];
    }

    static fromScores(scores: IScore[]) {
        scores.sort((a, b) => a.ended_at_seconds - b.ended_at_seconds);

        let activities = [];
        let currentActivity = new SessionCollectionActivity();

        scores.forEach((score, index) => {
            if (!score.beatmap) {
                return;
            }

            currentActivity.scores.push(score);

            if (!currentActivity.start) {
                if (score.started_at) {
                    currentActivity.start = score.started_at;
                } else {
                    currentActivity.start = new Date(score.ended_at.getTime() - score.duration * 1000);
                }
            }

            currentActivity.end = score.ended_at;

            if (index < scores.length - 1) {
                const nextScore = scores[index + 1];
                const nextScoreStart = nextScore.started_at ? nextScore.started_at : new Date(nextScore.ended_at.getTime() - nextScore.duration * 1000);
                const diff = (nextScoreStart.getTime() - currentActivity.end.getTime()) / 1000;

                if (diff >= SESSION_ACTIVITY_THRESHOLD) {
                    currentActivity.end = score.ended_at;
                    currentActivity.done = true;
                } else if (diff >= SESSION_BREAK_THRESHOLD) {
                    currentActivity.breaks.push(new SessionBreak(
                        score.ended_at,
                        nextScoreStart,
                        diff
                    ));
                }
            } else if (index === scores.length - 1) {
                currentActivity.end = score.ended_at;
                currentActivity.done = true;
            }

            if (currentActivity.done) {
                currentActivity.duration = (currentActivity.end.getTime() - currentActivity.start.getTime()) / 1000;
                // activities.push(currentActivity);
                activities.push(new Session(
                    currentActivity.start,
                    currentActivity.end,
                    currentActivity.scores,
                    currentActivity.breaks,
                    currentActivity.duration
                ));
                if (index < scores.length - 1) {
                    currentActivity = new SessionCollectionActivity();
                }
            }
        });

        return new SessionCollection(activities);
    }
}

export default SessionCollection;