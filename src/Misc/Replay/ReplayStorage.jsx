import axios from "axios";
import { GetAPI } from "../ApiHelper";
import Replay from "./Replay";

const DOWNLOAD_URL = `${GetAPI()}/replay/{scoreId}`;

const MEM_CACHE = {};

// This is the global replay manager really
class ReplayStorage {
    static async get(scoreId) {
        if(MEM_CACHE[scoreId]) {
            return MEM_CACHE[scoreId];
        }

        //for now it wont store locally
        return this._internal_get_from_api(scoreId);
    }

    static async _internal_get_from_api(scoreId) {
        const url = DOWNLOAD_URL.replace("{scoreId}", scoreId);
        //returns json
        const response = await axios.get(url);

        if(response.status !== 200) {
            throw new Error(`Failed to download replay for score ${scoreId}: ${response.statusText}`);
        }

        const replay = await Replay.fromResponse(response.data);

        MEM_CACHE[scoreId] = replay;
        
        return replay;
    }
}

export default ReplayStorage;