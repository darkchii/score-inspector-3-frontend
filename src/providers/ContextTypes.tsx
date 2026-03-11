export type ApiContextValue = {
    getUserLive: (userId: string | number, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getScoresLive: (userId: string | number, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getBeatmapsLive: (compact?: boolean, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getBeatmapPacks: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getCompletionists: () => Promise<any>;
    getUserSearch: (query: string, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getLeaderboard: (ruleset: string, statistic: string, page: number, sort_direction?: string, limit?: number, country?: string | null, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getTodayTopPlayers: (ruleset: string, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getGlobalStats: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getScoreSubmissions: (ruleset: string, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getActiveUsers: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getRoleUsers: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getServerInfo: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getAlerts: (progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getProcessedRealm: (realmFile: File, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getScoreRankDates: (ruleset: string, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
    getHistoricScoreRanks: (ruleset: string, stat: string, date: string, page: number, progressEvent?: ((progressEvent: any) => void) | null) => Promise<any>;
};

export type AuthContextValue = {
    user: any;
    userData: any;
    token: string;
    loading: boolean;
    login: (code: string) => Promise<void>;
    logout: () => void;
};

export type ProfileContextValue = {
    getUser: (userId: string | number) => Promise<any>;
    getScoreById: (scoreId: string | number) => any;
    getApiUser: () => any;
    userLive: any;
    scoresLive: any;
    setUserId: (userId: string | number) => void;
    fetchFullProfile: (userId: string | number) => Promise<void>;
    errorMessage: string | boolean;
    fetchLog: any[];
    isFinished: boolean;
    activeRuleset: string | null;
    setActiveRuleset: (ruleset: string | null) => void;
    getRulesetStatistics: (ruleset: string, without_loved?: boolean) => any;
    getRulesetUser: (ruleset: string) => any;
    availableRulesets: string[];
    loadDurationMs: number;
};

export type ReputationContextValue = {
    //TODO
};

export type ScoreViewContextValue = {
    loadScoreView: (score: any) => void;
    unloadScoreView: () => void;
    enabled: boolean;
};

export type SearchContextValue = {
    openSearch: () => void;
    closeSearch: () => void;
    isSearchOpen: boolean;
};

export type TitleContextValue = {
    setTitle: (title: string) => void;
};