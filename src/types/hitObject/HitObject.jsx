// Bit index 	Meaning
// 0 	Marks the object as a hit circle
// 1 	Marks the object as a slider
// 2 	Marks the start of a new combo
// 3 	Marks the object as a spinner
// 4, 5, 6 	A 3-bit integer specifying how many combo colours to skip, a practice referred to as "colour hax". Only relevant if the object starts a new combo.
// 7 	Marks the object as an osu!mania hold note.
const HitObjectTypes = {
    HitCircle: 1 << 0,
    Slider: 1 << 1,
    NewCombo: 1 << 2,
    Spinner: 1 << 3,
    ColourHaxStart: 1 << 4,
    ColourHaxMiddle: 1 << 5,
    ColourHaxEnd: 1 << 6,
    ManiaHoldNote: 1 << 7,
}

const HitSounds = {
    Normal: 1 << 0,
    Whistle: 1 << 1,
    Finish: 1 << 2,
    Clap: 1 << 3,
}

class HitObject {
    constructor(x, y, time) {
        this.x = x;
        this.y = y;
        this.time = time;
    }

    static parseFromLine(line) {
        const parts = line.split(',');
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        const time = parseInt(parts[2]);
        const type = parseInt(parts[3]);
        //objectParams and hitSample can be more complex, skipping for now

        let hitObject = null;
        if (type & HitObjectTypes.HitCircle) {
            hitObject = new HitCircleObject(x, y, time);
        }else if(type & HitObjectTypes.Slider){
            hitObject = new SliderObject(x, y, time);

            hitObject.curveType = parts[5].charAt(0);
            hitObject.curvePoints = parts[5].split('|').slice(1).map(pt => {
                const [px, py] = pt.split(':').map(Number);
                return { x: px, y: py };
            });
            hitObject.repeatCount = parseInt(parts[6]);
            hitObject.pixelLength = parseFloat(parts[7]);

            //audio: not needed
            //edge sounds
            //edge sets
        }else if(type & HitObjectTypes.Spinner){
            hitObject = new SpinnerObject(time);
            hitObject.endTime = parseInt(parts[5]);
        }else if(type & HitObjectTypes.ManiaHoldNote){
            hitObject = new HoldObject(x, y, time);
            hitObject.endTime = parseInt(parts[5]);
        }

        return hitObject;
    }

    clone() {
        return new HitObject(this.x, this.y, this.time);
    }
}

class HitCircleObject extends HitObject {
    constructor(x, y, time) {
        super(x, y, time);
        this.type = 'HitCircle';
    }

    clone() {
        return new HitCircleObject(this.x, this.y, this.time);
    }
}

class SliderObject extends HitObject {
    constructor(x, y, time) {
        super(x, y, time);
        this.type = 'Slider';

        this.curveType = null; // e.g., 'B' for Bezier
        this.curvePoints = [];
        this.repeatCount = 0;
        this.pixelLength = 0;
    }

    clone() {
        const cloned = new SliderObject(this.x, this.y, this.time);
        cloned.curveType = this.curveType;
        cloned.curvePoints = JSON.parse(JSON.stringify(this.curvePoints));
        cloned.repeatCount = this.repeatCount;
        cloned.pixelLength = this.pixelLength;
        return cloned;
    }
}

class SpinnerObject extends HitObject {
    constructor(time) {
        super(256, 192, time);
        this.type = 'Spinner';
        this.endTime = 0;
    }

    clone() {
        const cloned = new SpinnerObject(this.time);
        cloned.endTime = this.endTime;
        return cloned;
    }
}

class HoldObject extends HitObject {
    constructor(x, y, time) {
        super(x, y, time);
        this.type = 'Hold';
        this.endTime = 0;
    }

    clone() {
        const cloned = new HoldObject(this.x, this.y, this.time);
        cloned.endTime = this.endTime;
        return cloned;
    }
}

export default HitObject;