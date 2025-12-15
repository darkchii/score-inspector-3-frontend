import axios from "axios";
import { GetAPI } from "../util/ApiHelper";
import HitObject from "./hitObject/HitObject";
import TimingPoint from "./hitObject/TimingPoint";

class RawBeatmapMetadata {
    constructor() {

    }
}

//beatmap .osu file
class RawBeatmap {
    constructor() {
        //some default properties
        this.StackLeniency = 0.7;
        this.DistanceSpacing = 1.0;
        this.TimelineZoom = 1.0;
        this.Version = 14;
    }

    static parseFromFile(file_content) {
        const rawBeatmap = new RawBeatmap();

        const lines = file_content.split('\n');
        let currentSection = null;

        //first line is always the format version
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine.startsWith('osu file format v')) {
                rawBeatmap.Version = parseInt(firstLine.substring('osu file format v'.length));
            }
        }

        for (let line of lines) {
            line = line.trim();
            if (line.length === 0) continue; //skip empty lines
            if (line.startsWith('[') && line.endsWith(']')) {
                //new section
                currentSection = line.substring(1, line.length - 1);
                if (!rawBeatmap[currentSection]) {

                    switch (currentSection) {
                        case 'General':
                        case 'Metadata':
                        case 'Difficulty':
                        case 'Editor':
                        case 'Colours':
                        default:
                            rawBeatmap[currentSection] = {};
                            break;
                        case 'HitObjects':
                        case 'TimingPoints':
                            rawBeatmap[currentSection] = [];
                            break;
                    }
                }
                continue;
            }

            //parse line based on current section
            switch (currentSection) {
                case 'General':
                case 'Metadata':
                case 'Difficulty':
                case 'Editor':
                case 'Colours':
                    const [key, value] = line.split(':').map(s => s.trim());
                    rawBeatmap[currentSection][key] = value;
                    break;
                case 'HitObjects':
                    //each line is a hit object
                    const ho = HitObject.parseFromLine(line);
                    rawBeatmap[currentSection].push(ho);
                    break;
                case 'TimingPoints':
                    const tp = TimingPoint.parseFromLine(line);
                    rawBeatmap[currentSection].push(tp);
                    break;
                default:
                    //other sections can be ignored for now
                    break;
            }
        }

        console.log("Parsed RawBeatmap:", rawBeatmap);

        return rawBeatmap;
    }

    static async fetchFromApi(beatmapId) {
        const api = GetAPI();
        const url = `${api}/beatmap/${beatmapId}/file`;

        try {
            const response = await axios.get(url);
            if (response.data) {
                return RawBeatmap.parseFromFile(response.data);
            } else {
                throw new Error("No data received from API.");
            }
        } catch (error) {
            console.error("Error fetching raw beatmap data:", error);
            return null;
        }
    }

    //Typically done to apply mods while keeping the original intact
    clone() {
        const cloned = new RawBeatmap();
        
        //deep clone all properties
        for (const key in this) {
            if (Array.isArray(this[key])) {
                cloned[key] = this[key].map(item => {
                    if (item.clone) {
                        return item.clone();
                    } else {
                        return JSON.parse(JSON.stringify(item));
                    }
                });
            } else if (this[key] && typeof this[key] === 'object' && this[key].clone) {
                cloned[key] = this[key].clone();
            } else if (this[key] && typeof this[key] === 'object') {
                cloned[key] = JSON.parse(JSON.stringify(this[key]));
            } else {
                cloned[key] = this[key];
            }
        }

        return cloned;
    }
}

export default RawBeatmap;