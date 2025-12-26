export const FILTER_FIELDS = [
    { label: 'ID', value: 'id', type: 'number' },
    { label: 'Beatmap ID', value: 'beatmap.beatmap_id', type: 'number' },
    { label: 'Accuracy', value: 'accuracy', type: 'number' },
    { label: 'PP', value: 'implied_pp', type: 'number' },
    { label: 'Combo', value: 'combo', type: 'number' },
    { label: 'Max Combo', value: 'beatmap.max_combo', type: 'number' },
    { label: 'Circles', value: 'beatmap.circles', type: 'number' },
    { label: 'Sliders', value: 'beatmap.sliders', type: 'number' },
    { label: 'Spinners', value: 'beatmap.spinners', type: 'number' },
    { label: 'Stars', value: 'star_rating', type: 'number' },
    { label: 'Ranked Date', value: 'beatmap.ranked_date', type: 'datetime' },
    { label: 'Played Date', value: 'ended_at', type: 'datetime' },
    { label: 'Score', value: 'total_score', type: 'number' },
    { label: "Grade", value: "grade", type: "grade", group: "Score" },
]

export const GRADE_ORDER = [
    "XH",
    "X",
    "SH",
    "S",
    "A",
    "B",
    "C",
    "D"
]

export const EMPTY_FILTER = {
    type: "group",
    operator: "AND",
    children: []
}

export const EMPTY_SORT = {
    field: null,   // e.g. "pp"
    direction: "asc" // "asc" | "desc"
}

export const OPERATORS_BY_TYPE = {
    number: [
        { label: "=", value: "=" },
        { label: "!=", value: "!=" },
        { label: ">", value: ">" },
        { label: ">=", value: ">=" },
        { label: "<", value: "<" },
        { label: "<=", value: "<=" }
    ],
    string: [
        { label: "equals", value: "=" },
        { label: "not equals", value: "!=" },
        { label: "contains", value: "contains" },
        { label: "starts with", value: "startsWith" },
        { label: "ends with", value: "endsWith" }
    ],
    datetime: [
        { label: "is", value: "=" },
        { label: "before", value: "<" },
        { label: "after", value: ">" },
        { label: "on or before", value: "<=" },
        { label: "on or after", value: ">=" }
    ],
    grade: [
        { label: "is", value: "=" },
        { label: "is not", value: "!=" },
        { label: "better than", value: ">" },
        { label: "better than or equal", value: ">=" },
        { label: "worse than", value: "<" },
        { label: "worse than or equal", value: "<=" }
    ]
}

const getFieldDef = field =>
    FILTER_FIELDS.find(f => f.value === field)

const gradeRank = grade =>
    GRADE_ORDER.indexOf(grade)

export const compareByField = (a, b, sort) => {
    const { field, direction } = sort
    const def = getFieldDef(field)

    if (!def) return 0

    const av = getValueByPath(a, field)
    const bv = getValueByPath(b, field)

    let result = 0

    if (def.type === "grade") {
        const aRank = gradeRank(av)
        const bRank = gradeRank(bv)
        result = aRank - bRank
    }

    if (def.type === "number") {
        result = Number(av) - Number(bv)
    }

    if (def.type === "string") {
        result = String(av ?? "").localeCompare(String(bv ?? ""))
    }

    if (def.type === "datetime") {
        result =
            new Date(av).getTime() - new Date(bv).getTime()
    }

    return direction === "asc" ? result : -result
}

export const getValueByPath = (obj, path) => {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}

export const evaluateRule = (item, rule) => {
    const fieldDef = getFieldDef(rule.field)
    if (!fieldDef) return true

    const rawValue = getValueByPath(item, rule.field)
    const ruleValue = rule.value

    if (fieldDef.type === "grade") {
        const vRank = gradeRank(rawValue)
        const rRank = gradeRank(ruleValue)

        if (vRank === -1 || rRank === -1) return false

        switch (rule.comparator) {
            case "=": return vRank === rRank
            case "!=": return vRank !== rRank
            case ">": return vRank < rRank     // better = lower index
            case ">=": return vRank <= rRank
            case "<": return vRank > rRank
            case "<=": return vRank >= rRank
            default: return true
        }
    }

    if (fieldDef.type === "datetime") {
        const itemTime = new Date(rawValue).getTime()
        const ruleTime = new Date(rule.value).getTime()

        if (Number.isNaN(itemTime) || Number.isNaN(ruleTime)) return false

        switch (rule.comparator) {
            case "=": return itemTime === ruleTime
            case "<": return itemTime < ruleTime
            case "<=": return itemTime <= ruleTime
            case ">": return itemTime > ruleTime
            case ">=": return itemTime >= ruleTime
            default: return true
        }
    }

    if (fieldDef.type === "number") {
        const v = Number(rawValue)
        const c = Number(ruleValue)

        if (Number.isNaN(v) || Number.isNaN(c)) return false

        switch (rule.comparator) {
            case "=": return v === c
            case "!=": return v !== c
            case ">": return v > c
            case ">=": return v >= c
            case "<": return v < c
            case "<=": return v <= c
            default: return true
        }
    }

    if (fieldDef.type === "string") {
        const v = String(rawValue ?? "")
        const c = String(ruleValue ?? "")

        switch (rule.comparator) {
            case "=": return v === c
            case "!=": return v !== c
            case "contains": return v.includes(c)
            case "startsWith": return v.startsWith(c)
            case "endsWith": return v.endsWith(c)
            default: return true
        }
    }

    return true
}

export const evaluateGroup = (item, group) => {
    if (!group.children?.length === 0) {
        return true;
    }

    if (group.operator === 'AND') {
        return group.children.every(child =>
            child.type === 'rule'
                ? evaluateRule(item, child)
                : evaluateGroup(item, child)
        );
    }

    if (group.operator === 'OR') {
        return group.children.some(child =>
            child.type === 'rule'
                ? evaluateRule(item, child)
                : evaluateGroup(item, child)
        );
    }

    return true;
}
