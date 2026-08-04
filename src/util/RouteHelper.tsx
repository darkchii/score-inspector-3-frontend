export const routeData = {
    route404: {
        path: '*'
    },
    routeIndex: {
        path: '/'
    },
    routePeople: {
        path: '/people'
    },
    routeTools: {
        path: '/tools/:tool?'
    },
    routeProfile: {
        path: '/user/:userId/:ruleset?/:page?'
    },
    routeScoreRank: {
        path: "/scorerank/:ruleset?/:stat?/:date?/page?/:page?"
    },
    routeCompletionists: {
        path: "/completionists"
    },
    routeLeaderboards: {
        path: "/leaderboards/:ruleset?/:statistic?/page?/:page?/country?/:country?"
    },
    routeAdmin: {
        path: "/admin/:tab?"
    },
    routeBeatmaps: {
        path: "/beatmap/:beatmapId" //beatmapId for now required, will be optional later when implementing a search engine
    },
    routeBeatmapsets: {
        path: "/beatmapset/:beatmapsetId/:ruleset?/:beatmapId?"
    },
    routeTeam: {
        path: "/team/:teamId/:ruleset?"
    }
}

export function GenerateUrl(path: string, data: any = {}) {
    let url = path;
    //also take care of the question mark. If any optional isn't provided, the remainder is also removed
    for (const key in data) {
        url = url.replace(`:${key}?`, data[key] ? data[key].toString() : '');
        url = url.replace(`:${key}`, data[key] ? data[key].toString() : '');
    }
    //remove any remaining optional params
    url = url.replace(/\/:.*?\?/g, '');
    return url;
}

export function UpdateUrl(path: string, data: any = {}) {
    //just use .replace on path
    let url = GenerateUrl(path, data);
    window.history.pushState({}, '', url);
}
