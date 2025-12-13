import ReplayDataPoint from "./ReplayDataPoint";

class Replay {
    constructor() {
        this.ruleset_id = -1;
        this.version = -1;
        this.beatmap_md5 = "";
        this.username = "";
        this.replay_md5 = "";
        this.count300 = 0;
        this.count100 = 0;
        this.count50 = 0;
        this.countGeki = 0;
        this.countKatu = 0;
        this.countMiss = 0;
        this.score = 0;
        this.combo = 0;
        this.perfect = false;
        this.mods_int = 0;
        this.life_bar = "";
        this.timestamp = null;
        this.replay_length = 0;
        this.replay_data = null;
    }

    static async fromResponse(response) {
        const replay = new Replay();
        replay.ruleset_id = response.gameMode;
        replay.version = response.gameVersion;
        replay.beatmap_md5 = response.beatmapMD5;
        replay.username = response.playerName;
        replay.replay_md5 = response.replayMD5;

        replay.count300 = response.number_300s;
        replay.count100 = response.number_100s;
        replay.count50 = response.number_50s;
        replay.countGeki = response.gekis;
        replay.countKatu = response.katus;
        replay.countMiss = response.misses;

        replay.score = response.score;
        replay.combo = response.max_combo;

        replay.perfect = response.perfect_combo === 1;
        replay.mods_int = response.mods;

        replay.life_bar = response.life_bar;

        replay.timestamp = new Date(response.timestamp);

        replay.replay_length = response.replay_length;
        replay.replay_data = ReplayDataPoint.fromArrayString(response.replay_data);

        replay.graph_data = Replay.generateGraphData(replay);

        return replay;
    }

    static generateGraphData(replay) {
        let graphData = {};

        if(replay.ruleset_id === 0){
            //heatmap (dataset per key)
            //dataset = [{x: n, y: n, color: 'rgba(r,g,b,a)'}]
            const heatmap = {};
            for(const point of replay.replay_data) {
                if(point.keys_int > 0) {
                    for(const [key, pressed] of Object.entries(point.keys)) {
                        if(pressed) {
                            if(!heatmap[key]) {
                                heatmap[key] = [];
                            }
                            heatmap[key].push({ x: point.x, y: point.y});
                        }
                    }
                }
            }

            //Reorder keys to M1, M2, K1, K2, Smoke
            const orderedHeatmap = {};
            const keyOrder = ['M1', 'M2', 'K1', 'K2', 'Smoke'];
            for(const key of keyOrder) {
                if(heatmap[key]) {
                    orderedHeatmap[key] = heatmap[key];
                }
            }

            graphData.heatmap = orderedHeatmap;
        }

        return graphData;
    }
}

export default Replay;