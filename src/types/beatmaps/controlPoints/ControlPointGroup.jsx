import ControlPoint from "./ControlPoint";

class ControlPointGroup {
    constructor(data) {
        this.Time = data.time;
        this.ControlPoints = data.controlPoints?.length > 0 ? data.controlPoints.map(cp => new ControlPoint(cp)) : [];
    }
}

export default ControlPointGroup;