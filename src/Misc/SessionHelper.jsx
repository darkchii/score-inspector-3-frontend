const SESSION_ACTIVITY_THRESHOLD = 60 * 60 * 1.5; //this value dictates a new activity region
const SESSION_BREAK_THRESHOLD = 60 * 5; //this value dictates a break region

class Session {
    constructor(start, end, scores, breaks, duration) {
        this.id = `${start.getTime()}`;
        this.start = start; //date object
        this.end = end; //date object
        this.scores = scores;
        this.breaks = breaks;
        this.duration = duration;

        this.break_count = breaks.length;
        this.total_break_time = breaks.reduce((acc, curr) => acc + curr.duration, 0);
        this.average_break_time = this.break_count > 0 ? this.total_break_time / this.break_count : 0;
        this.longest_break_time = this.break_count > 0 ? Math.max(...breaks.map(b => b.duration)) : 0;

        // Generate stats from scores
        this.score_count = scores.length;

        this.grades = {};

        this.cumulative_legacy_total_score = 0;
        this.average_legacy_total_score = 0;
        this.max_legacy_total_score = 0;

        this.cumulative_lazer_score = 0;
        this.average_lazer_score = 0;
        this.max_lazer_score = 0;

        this.cumulative_pp = 0;
        this.average_pp = 0;
        this.max_pp = 0;

        this.scores.forEach(score => {
            const grade = score.grade;
            if (!this.grades[grade]) {
                this.grades[grade] = 0;
            }
            this.grades[grade] += 1;
            this.cumulative_legacy_total_score += score.legacy_total_score;
            this.cumulative_lazer_score += score.lazer_score;
            this.cumulative_pp += score.pp;
            
            if (score.legacy_total_score > this.max_legacy_total_score) {
                this.max_legacy_total_score = score.legacy_total_score;
            }

            if (score.lazer_score > this.max_lazer_score) {
                this.max_lazer_score = score.lazer_score;
            }
            
            if (score.pp > this.max_pp) {
                this.max_pp = score.pp;
            }
        });

        if (this.score_count > 0) {
            this.average_legacy_total_score = this.cumulative_legacy_total_score / this.score_count;
            this.average_lazer_score = this.cumulative_lazer_score / this.score_count;
        }
    }
}

class SessionCollection {
    constructor(sessions) {
        this.sessions = sessions;
        this.session_map = {};
        sessions.forEach(session => {
            this.session_map[session.id] = session;
        });
        this.length = sessions.length;

        this.play_time = 0;
        if (this.length > 0) {
            let pt = 0;
            this.sessions.forEach(session => {
                pt += session.duration;
            });
            this.play_time = pt;
            this.duration_longest = Math.max(...this.sessions.map(s => s.duration));
            this.duration_average = this.play_time / this.length;
        }
    }

    get() {
        return this.sessions;
    }

    getById(id) {
        return this.session_map[id];
    }
}

export function GenerateSessions(scores) {
    scores.sort((a, b) => a.ended_at - b.ended_at);

    let activities = [];
    let currentActivity = {
        scores: [],
        start: null,
        end: null,
        done: false,
        breaks: []
    };

    scores.forEach((score, index) => {
        if (!score.beatmap) {
            return;
        }

        currentActivity.scores.push(score);

        if(!currentActivity.start){
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
            const diff = (nextScoreStart - currentActivity.end) / 1000;

            if (diff >= SESSION_ACTIVITY_THRESHOLD) {
                currentActivity.end = score.ended_at;
                currentActivity.done = true;
            } else if (diff >= SESSION_BREAK_THRESHOLD) {
                currentActivity.breaks.push({
                    start: score.ended_at,
                    end: nextScoreStart,
                    duration: diff,
                });
            }
        } else if (index === scores.length - 1) {
            currentActivity.end = score.ended_at;
            currentActivity.done = true;
        }

        if (currentActivity.done) {
            currentActivity.duration = (currentActivity.end - currentActivity.start) / 1000;
            // activities.push(currentActivity);
            activities.push(new Session(
                currentActivity.start,
                currentActivity.end,
                currentActivity.scores,
                currentActivity.breaks,
                currentActivity.duration
            ));
            if (index < scores.length - 1) {
                currentActivity = {
                    scores: [],
                    start: null,
                    end: null,
                    done: false,
                    breaks: []
                };
            }
        }
    });

    return new SessionCollection(activities);
}
