import { CalculateBonusPerformance, CalculateRawPerformance } from "./ScoreHelper";
import { GenerateSessions } from "./SessionHelper";

export class ProfileRulesetScoreSet {
    constructor() {
        this.scores = [];
        this.scores_map = {};
        this.grades = {};

        this.clears = 0;
        this.ranked_clears = 0;

        this.fc_count = 0;
        this.max_combo = 0;

        this.missing_difficulty = 0; //number of scores with missing beatmap difficulty data (its likely in queue for processing)

        this.legacy_total_score = 0;
        this.score = 0;

        this.performance_points = 0;
        this.bonus_performance_points = 0;

        this.duration_seconds = 0;

        this.recent_scores = [];

        this.sessions = [];
    }

    addScore(score) {
        this.scores.push(score);

        this.scores_map[score.id] = score;

        this.clears += 1;
        if (score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            this.ranked_clears += 1;
        }

        if(score.is_fc) {
            this.fc_count += 1;
        }

        if (score.combo > this.max_combo) {
            this.max_combo = score.combo;
        }

        this.duration_seconds += score.duration || 0;

        //count grades
        const grade = score.grade;
        this.grades[grade] = (this.grades[grade] || 0) + 1;

        this.legacy_total_score += score.legacy_total_score;
        this.score += score.total_score;

        if (score.diff_missing) {
            this.missing_difficulty += 1;
        }
    }

    reorder(param, descending = true) {
        this.scores.sort((a, b) => {
            if (descending) {
                return b[param] - a[param];
            } else {
                return a[param] - b[param];
            }
        });
    }

    calculate() {
        this.performance_points = CalculateRawPerformance(this.scores);
        //sum of all pp from all scores
        this.total_performance_points = this.scores.reduce((acc, score) => acc + (score.performance?.base?.pp || score.pp || 0), 0);
        this.bonus_performance_points = CalculateBonusPerformance(this.scores.length);
        this.average_performance = this.scores.length > 0 ? (this.total_performance_points / this.scores.length) : 0;

        this.average_accuracy = 0;
        this.average_length = 0;
        this.average_stars = 0;
        this.average_score = this.scores.length > 0 ? (this.score / this.scores.length) : 0;
        this.average_legacy_score = this.scores.length > 0 ? (this.legacy_total_score / this.scores.length) : 0;

        this.fc_rate = this.clears > 0 ? (this.fc_count / this.clears) : 0;

        if (this.scores.length > 0) {
            let totalAcc = 0;
            let totalLength = 0;
            let totalStars = 0;
            this.scores.forEach(score => {
                totalAcc += score.accuracy;
                totalLength += score.duration || 0;
                totalStars += (score.attr_diff?.star_rating || score.beatmap?.stars || 0);
            });
            this.average_accuracy = totalAcc / this.scores.length;
            this.average_length = totalLength / this.scores.length;
            this.average_stars = totalStars / this.scores.length;
        }

        //recent scores should be max 100, ordered by ended_at descending
        this.reorder('ended_at', true);
        this.recent_scores = this.scores.slice(0, 100);

        this.sessions = GenerateSessions(this.scores);
        this.sessions.sessions.sort((a, b) => b.start - a.start);
    }

    getById(id) {
        return this.scores_map[id];
    }
}