import CatchFruit from "../objects/CatchFruit";
import CatchJuiceStream from "../objects/CatchJuiceStream";
import ManiaHoldNote from "../objects/ManiaHoldNote";
import ManiaNote from "../objects/ManiaNote";
import OsuHitCircle from "../objects/OsuHitCircle";
import OsuSlider from "../objects/OsuSlider";
import OsuSpinner from "../objects/OsuSpinner";
import TaikoHit from "../objects/TaikoHit";
import TaikoSwell from "../objects/TaikoSwell";
import RawBeatmapDifficulty from "./RawBeatmapDifficulty";
import RawBeatmapInfo from "./RawBeatmapInfo";
import BreakPeriod from "./timing/BreakPeriod";

const HitObjectTypeMap = {
    "osu.Game.Rulesets.Osu.Objects.Slider": OsuSlider,
    "osu.Game.Rulesets.Osu.Objects.HitCircle": OsuHitCircle,
    "osu.Game.Rulesets.Osu.Objects.Spinner": OsuSpinner,

    "osu.Game.Rulesets.Taiko.Objects.Hit": TaikoHit,
    "osu.Game.Rulesets.Taiko.Objects.Swell": TaikoSwell,

    "osu.Game.Rulesets.Catch.Objects.JuiceStream": CatchJuiceStream,
    "osu.Game.Rulesets.Catch.Objects.Fruit": CatchFruit,

    "osu.Game.Rulesets.Mania.Objects.Note": ManiaNote,
    "osu.Game.Rulesets.Mania.Objects.HoldNote": ManiaHoldNote
}

//This contains .osu data, which is ALOT more than just api beatmap
class RawBeatmap {
    constructor(data) {
        this.BeatmapDifficulty = new RawBeatmapDifficulty(data.difficulty);
        this.BeatmapInfo = new RawBeatmapInfo(data.beatmapInfo);
        this.HitObjects = this.ProcessHitObjects(data.hitObjects);
        this.Breaks = data.breaks?.length > 0 ? data.breaks.map(b => new BreakPeriod(b)) : [];

        this.Bookmarks = data.bookmarks;

        this.AudioLeadIn = data.audioLeadIn;
        this.StackLeniency = data.stackLeniency;
        this.SpecialStyle = data.specialStyle;
        this.LetterboxInBreaks = data.letterboxInBreaks;
        this.EpilepsyWarning = data.epilepsyWarning;
        this.SamplesMatchPlaybackRate = data.samplesMatchPlaybackRate;

        this.DistanceSpacing = data.distanceSpacing;
        this.GridSize = data.gridSize;
        this.TimelineZoom = data.timelineZoom;
        this.Countdown = data.countdown;
        this.CountdownOffset = data.countdownOffset;
        this.Bookmarks = data.bookmarks;
        this.BeatmapVersion = data.beatmapVersion;

        //Non-standard fields
        this.HitsPerSeconds = CalculateHitsPerSecond(this.HitObjects);
    }

    CalculateHitsPerSecond(hitObjects) {
        
    }

    ProcessHitObjects(hitObjectsData) {
        const hitObjects = [];

        const lookup_table = hitObjectsData['$lookup_table'];
        //^ array of class names

        const objects_data = hitObjectsData['$items'];
        //^ array of actual object data (each object contains a type which points to an index in the lookup table)

        for (let objData of objects_data) {
            const typeIndex = objData['$type'];
            const className = lookup_table[typeIndex].split(',')[0]; //Get class name before

            const HitObjectClass = HitObjectTypeMap[className];

            if (!HitObjectClass) {
                console.warn(`Unknown HitObject class: ${className}`);
                continue;
            }

            const hitObject = new HitObjectClass(objData);

            //hitObject class name for reference
            hitObject.className = HitObjectClass.name;

            hitObjects.push(hitObject);
        }
        return hitObjects;
    }
}

export default RawBeatmap;