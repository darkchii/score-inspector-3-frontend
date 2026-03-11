import { CalculateBonusPerformance, CalculateRawPerformance } from "../util/ScoreHelper";
import SessionCollection from "./SessionCollection";
import type { IProfileRulesetScoreSet, IScore, ISessionCollection } from "./types";

export class ProfileRulesetScoreSet implements IProfileRulesetScoreSet {
    scores: IScore[] = [];
    scores_map: { [id: string]: IScore } = {};
    grades: { [grade: string]: number } = {};

    clears: number = 0;
    ranked_clears: number = 0;

    fc_count: number = 0;
    max_combo: number = 0;

    missing_difficulty: number = 0;

    implied_total_score: number = 0;
    implied_total_score_ss: number = 0;

    score: number = 0;
    score_ss: number = 0;

    performance_points: number = 0;
    total_performance_points: number = 0;
    bonus_performance_points: number = 0;
    average_performance: number = 0;

    duration_seconds: number = 0;

    recent_scores: IScore[] = [];
    top_scores: IScore[] = [];

    highlighted_scores: {
        top_pp: IScore | null;
        top_score: IScore | null;
        top_stars_fc: IScore | null;
        top_stars_ss: IScore | null;
        oldest: IScore | null;
    } = {
        top_pp: null,
        top_score: null,
        top_stars_fc: null,
        top_stars_ss: null,
        oldest: null,
    };

    sessions: ISessionCollection = new SessionCollection([]);

    scores_reordered: {
        [key: string]: IScore[];
    } = {};

    average_accuracy: number = 0;
    average_length: number = 0;
    average_stars: number = 0;
    average_score: number = 0;
    average_implied_score: number = 0;
    fc_rate: number = 0;

    constructor() {
        this.highlighted_scores['top_pp'] = null;
        this.highlighted_scores['top_score'] = null;
        this.highlighted_scores['top_stars_fc'] = null;
        this.highlighted_scores['top_stars_ss'] = null;
        this.highlighted_scores['oldest'] = null;

        this.scores_reordered = {};
    }

    static merge(sets: ProfileRulesetScoreSet[]) {
        const mergedSet = new ProfileRulesetScoreSet();
        sets.forEach(set => {
            set.scores.forEach(score => {
                mergedSet.addScore(score);
            });
        });
        //calculate
        mergedSet.calculate();
        return mergedSet;
    }

    addScore(score: IScore) {
        this.scores.push(score);

        this.scores_map[score.id] = score;

        this.clears += 1;
        if (score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            this.ranked_clears += 1;
        }

        if (score.is_fc) {
            this.fc_count += 1;
        }

        if (score.combo > this.max_combo) {
            this.max_combo = score.combo;
        }

        //ranked/approved only
        if (score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            if (this.highlighted_scores['top_pp'] === null || (score.implied_pp) > (this.highlighted_scores['top_pp'].implied_pp)) {
                this.highlighted_scores['top_pp'] = score;
            }
        }

        if (this.highlighted_scores['top_score'] === null || score.implied_total_score > this.highlighted_scores['top_score'].implied_total_score) {
            this.highlighted_scores['top_score'] = score;
        }

        if (score.is_fc && score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            if (this.highlighted_scores['top_stars_fc'] === null || (score.attr_diff?.star_rating || score.beatmap?.stars || 0) > (this.highlighted_scores['top_stars_fc'].attr_diff?.star_rating || this.highlighted_scores['top_stars_fc'].beatmap?.stars || 0)) {
                this.highlighted_scores['top_stars_fc'] = score;
            }
        }

        if (score.is_ss && score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            if (this.highlighted_scores['top_stars_ss'] === null || (score.attr_diff?.star_rating || score.beatmap?.stars || 0) > (this.highlighted_scores['top_stars_ss'].attr_diff?.star_rating || this.highlighted_scores['top_stars_ss'].beatmap?.stars || 0)) {
                this.highlighted_scores['top_stars_ss'] = score;
            }
        }

        if (this.highlighted_scores['oldest'] === null || score.ended_at < this.highlighted_scores['oldest'].ended_at) {
            this.highlighted_scores['oldest'] = score;
        }

        this.duration_seconds += score.duration || 0;

        //count grades
        const grade = score.grade;
        this.grades[grade] = (this.grades[grade] || 0) + 1;

        this.implied_total_score += score.implied_total_score;
        this.score += score.total_score;

        this.implied_total_score_ss += score.is_ss ? score.implied_total_score : 0;
        this.score_ss += score.is_ss ? score.total_score : 0;

        if (score.diff_missing) {
            this.missing_difficulty += 1;
        }
    }

    reorder(param: keyof IScore, descending: boolean = true) {
        // this.scores.sort((a, b) => {
        //     if (descending) {
        //         return b[param] - a[param];
        //     } else {
        //         return a[param] - b[param];
        //     }
        // });

        //needs to be faster sort for large arrays
        this.scores = this.scores.slice().sort((a, b) => {
            const aValue = a[param] || 0;
            const bValue = b[param] || 0;
            if (descending) {
                return bValue - aValue;
            } else {
                return aValue - bValue;
            }
        });
    }

    calculate() {
        //sum of all pp from all scores
        this.total_performance_points = this.scores.reduce((acc, score) => acc + score.implied_pp, 0);
        this.bonus_performance_points = CalculateBonusPerformance(this.scores.length);
        this.average_performance = this.scores.length > 0 ? (this.total_performance_points / this.scores.length) : 0;

        this.average_accuracy = 0;
        this.average_length = 0;
        this.average_stars = 0;
        this.average_score = this.scores.length > 0 ? (this.score / this.scores.length) : 0;
        this.average_implied_score = this.scores.length > 0 ? (this.implied_total_score / this.scores.length) : 0;

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

        this.reorder('ended_at_seconds', true);
        this.recent_scores = this.scores.slice(0, 100);
        this.scores_reordered['date'] = this.recent_scores;

        this.reorder('implied_pp', true);
        this.top_scores = this.scores.slice(0, 200);
        this.scores_reordered['pp'] = this.top_scores;
        this.performance_points = CalculateRawPerformance(this.scores, false, false);

        this.sessions = SessionCollection.fromScores(this.scores);
        this.sessions.sessions.sort((a, b) => b.start.getTime() - a.start.getTime());
    }

    getById(id: string): IScore | undefined {
        return this.scores_map[id];
    }
}