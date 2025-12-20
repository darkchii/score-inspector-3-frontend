import ControlPointGroup from "./ControlPointGroup";

class ControlPointInfo {
    constructor(data) {
        this.Groups = data.groups?.length > 0 ? data.groups.map(g => new ControlPointGroup(g)) : [];
    }
}

export default ControlPointInfo;