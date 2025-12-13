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

        this.cumulative_implied_total_score = 0;
        this.average_implied_total_score = 0;
        this.max_implied_total_score = 0;

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
            this.cumulative_implied_total_score += score.implied_total_score;
            this.cumulative_lazer_score += score.lazer_score;
            this.cumulative_pp += score.pp;
            
            if (score.implied_total_score > this.max_implied_total_score) {
                this.max_implied_total_score = score.implied_total_score;
            }

            if (score.lazer_score > this.max_lazer_score) {
                this.max_lazer_score = score.lazer_score;
            }
            
            if (score.pp > this.max_pp) {
                this.max_pp = score.pp;
            }
        });

        if (this.score_count > 0) {
            this.average_implied_total_score = this.cumulative_implied_total_score / this.score_count;
            this.average_lazer_score = this.cumulative_lazer_score / this.score_count;
        }
    }
}

export default Session;